const base64 = require('base-64'); // required for combining client secret and id for spotify auth
const account = new (require('./account'))();
const UserInfoInterface = require('./userInfoInterface');
const request = require('request');

function getExpiryDate(expiresIn) {
    // return the actual date/time the token expires.
    // expiresIn, from spotify, is number of seconds until it expires.
    return new Date(Date.now() + expiresIn*1000);
}

// class variables
let app, redirectURI;
let scope = 'user-read-recently-played';


class OAuth {
    
 
    constructor(expressApp){
       
        app = expressApp;

        redirectURI = app.host + '/saveCode';
    };

    // this is where user logs in to
    // First step in oAuth process. To get access code (for getting auth token)
    // make page for user to click 'allow' on, then wait for spotify to call server with auth code
    static authorize(req, res) {    
        let showLogin = false;
        // check to see users' auth status
        if (req.session.idtoken) {
            
            account.checkAuth(req.session).then((userID) => {
                if (userID) {
                    // authenticated, so connect spotify account
                    // TODO check if account is already authorized. It's harmless to skip
                    // but could save users time

                    // for now, just always go through auth process
                    
                    res.redirect('https://accounts.spotify.com/authorize' +
                        '?response_type=code' +
                        '&client_id=' + app.clientID +
                        '&state=' + userID +
                        '&scope=' + scope +
                        '&show_dialog=true' +
                        '&redirect_uri=' + encodeURIComponent(redirectURI)
                    );
                } else {
                    showLogin = true;
                }
            });
            
        } else {
            showLogin = true;
        }
        
        if (showLogin) {
            console.log('redirect back to login');
            res.redirect('/login');
        }

    };



        // this is the callback from spotify
    
    static saveCode(req, res) {
        // access code is in query string
        // ?code=fesjklfjseklveiojes&state=userID
        
        
        // strip the code from the request url
        let accessCode = req.query.code;
        let userID = req.query.state;
        

        if (req.url.indexOf('error') > 1) {
            // figure out what to do if user denies application
            // TODO
            console.error('user denied auth');
            res.send('access denied');
            return;
        }
        
        // get token
        let call = {
            //method: 'post',
            url : 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization' : 'Basic ' + (new Buffer(app.clientID + ':' + app.clientSecret).toString('base64'))
            },
            form: {
                'grant_type': 'authorization_code',
                'code' : accessCode,
                'redirect_uri' : redirectURI,
            },
            json: true
        };
        
        // this call back to Spotify, with the access code, 
        // returns the user's access token and refresh token
        request.post(call, (err, httpResponse, body) => {
            if (err) {
                console.log(err);
                res.send('error');
                console.error(err);
                return;
                //todo
            } else {
                //console.log(httpResponse);
                //res.send(body);
                res.send(`<a href="/users/${userID}/last50">your last 50 songs</a><br>
                            <a href="/logout">logout</a>`);
                //console.log(body);
            }
            let spotifyAuth = {
                'accessToken' : body.access_token,
                'expiresAt' : getExpiryDate(body.expires_in), // num seconds 
                'refreshToken' : body.refresh_token // for getting new tokens
            };

            UserInfoInterface.getUserByGoogleID(userID)
                .then((user) => {
                    user.SpotifyAuth = spotifyAuth;
                    return UserInfoInterface.updateUser(user);
                });
                // TODO catch
        });

    };    


        
        

    // get a new auth token when the old one expires
    static renewToken(user) {
        // call /api/token with refresh token

        return new Promise((resolve, reject) => {
            
            let refreshToken = user.SpotifyAuth.refreshToken;
            let call = {
                url: 'https://accounts.spotify.com/api/token',
                headers: {
                    'Authorization' : 'Basic ' + (new Buffer(app.clientID + ':' + app.clientSecret).toString('base64'))
                },
                form: {
                    'grant_type' : 'refresh_token',
                    'refresh_token' : refreshToken
                },
                json: true
            };
            
        

            request.post(call, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }

                
                if (body.refresh_token) {
                    // there's a new refresh token in town
                    // refresh_token will be undefined unless the backend sends a new one
                    refreshToken = body.refresh_token;
                }
                let ret = {
                    'accessToken' : body.access_token,
                    'expiresAt' : getExpiryDate(body.expires_in), // num seconds 
                    'refreshToken' : refreshToken // for getting new tokens
                };

                user.SpotifyAuth = ret;
                resolve(user);
            });
        }).then(UserInfoInterface.updateUser);

        
        

    };

};

module.exports = OAuth;
