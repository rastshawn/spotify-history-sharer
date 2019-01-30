const base64 = require('base-64'); // required for combining client secret and id for spotify auth
const acc = require('./account');


module.exports = function (app, request, users) {
    
    const account = new acc(app, request);

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
            let authObj = {
                'accessToken' : body.access_token,
                'expiresIn' : body.expires_in, // num seconds 
                'refreshToken' : body.refresh_token // for getting new tokens
            };

            app.users[userID].authObj = authObj;
        });

    });    


        
        

    // get a new auth token when the old one expires
    this.renewToken = function(refreshToken) {
        // call /api/token with refresh token

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
        }
        
        return new Promise((resolve, reject) => {

            request.post(call, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                }

                let ret = {
                    'accessToken' : body.access_token,
                    'expiresIn' : body.expires_in, // num seconds 
                    'refreshToken' : body.refresh_token // for getting new tokens
                };

                // refreshToken will be undefined unless the backend sends a new one
                resolve(ret);
            });

        });
        

    };

};
