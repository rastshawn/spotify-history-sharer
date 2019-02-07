const base64 = require('base-64'); // required for combining client secret and id for spotify auth
const account = new (require('./account'))();
const UserInfoInterface = require('./userInfoInterface');

function getExpiryDate(expiresIn) {
    // return the actual date/time the token expires.
    // expiresIn, from spotify, is number of seconds until it expires.
    return new Date(Date.now() + expiresIn);
}

module.exports = function (app, request) {
    
 

    let clientID = app.clientID; // must be passed in
    let clientSecret = app.clientSecret; // same
    let scope = 'user-read-recently-played';
    let host = app.host;

    let redirectURI = host + '/saveCode';


    // this is where user logs in to
    // First step in oAuth process. To get access code (for getting auth token)
    // make page for user to click 'allow' on, then wait for spotify to call server with auth code
    app.get('/authorize', (req, res) => {
        
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
                        '&client_id=' + clientID +
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

    });



        // this is the callback from spotify
    app.get('/saveCode', (req, res) => {
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

    });    


        
        

    // get a new auth token when the old one expires
    this.renewToken = function(user) {
        // call /api/token with refresh token
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
                return err;
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
            
            return UserInfoInterface.updateUser(user);
            
        });

        
        

    };

};
