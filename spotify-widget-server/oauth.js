const base64 = require('base-64'); // required for combining client secret and id for spotify auth



module.exports = function (app, request, users) {

    
    let clientID = app.clientID; // must be passed in
    let clientSecret = app.clientSecret; // same
    let scope = 'user-read-recently-played';
    let host = app.host;

    let redirectURI = host + '/saveCode';


    // this is where user logs in to
    // First step in oAuth process. To get access code (for getting auth token)
    // make page for user to click 'allow' on, then wait for spotify to call server with auth code
    app.get('/authorize', (req, res) => {
        console.log(req.session);

        if (req.session.userID) {
            res.redirect('https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + clientID +
                '&state=' + req.session.userID +
                '&scope=' + scope +
                '&show_dialog=true' +
                '&redirect_uri=' + encodeURIComponent(redirectURI)
            );
        } else {
            res.redirect('/login');
        }

    });



        // this is the callback from spotify
    app.get('/saveCode', (req, res) => {
        // access code is in query string
        // ?code=fesjklfjseklveiojes&state=asefiojvjekls
        
        
        // strip the code from the request url
        let accessCode = req.query.code;
        let userID = req.query.state;
        

        if (req.url.indexOf('error') > 1) {
            // figure out what to do if user denies application
            // TODO
            console.error('user denied auth');
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
                'Authorization' : 'Basic ' + base64.encode(app.clientID + app.clientSecret),
                'type' : 'application/x-www-form-urlencoded'
            },
            body: {
                'grant_type' : 'refresh_token',
                'refresh_token' : refreshToken
            }
        }
        
        return new Promise((resolve, reject) => {

            request.post(call, (response, body, error) => {
                if (error) {
                    // TODO
                }

                let ret = {
                    'accessToken' : body.access_token,
                    'expiresIn' : body.expires_in, // num seconds 
                    'refreshToken' : body.refresh_token // for getting new tokens
                };

                resolve(ret);
            });

        });
        

    };

};
