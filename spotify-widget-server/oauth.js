const base64 = require('base-64');

module.exports = function (app, request) {
    this.getAuthToken = function() {
        
        let clientID = app.clientID; // must be passed in
        let clientSecret = app.clientSecret; // same
        let scope = 'user-read-recently-played';
        let host = app.host;
        // for top add user-top-read with %20 as space
        // for currently playing add user-read-currently-playing
        let redirectURI = host + '/saveCode';


        app.get('/authorize', (req, res) => {
            res.redirect('https://accounts.spotify.com/authorize' +
                '?response_type=code' +
                '&client_id=' + clientID +
                '&scope=' + scope +
                '&redirect_uri=' + encodeURIComponent(redirectURI)
            );
        });


        // this is probably bad practice.
        // Probably make a authConfirmed() event instead
        return new Promise((resolve, reject) => {

            app.get('/saveCode', (req, res) => {
                // access code is in query string
                // ?code=fesjklfjseklveiojes&state=asefiojvjekls
                
                let accessCode = req.url.split('?code=').pop();
                
                if (req.url.indexOf('error') > 1) {
                    // figure out what to do if user denies application
                    // TODO
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
                
    
                request.post(call, (err, httpResponse, body) => {
                    if (err) {
                        console.log(err);
                        res.send('error');
                        //todo
                    } else {
                        //console.log(httpResponse);
                        //res.send(body);
                        res.send('access granted');
                        //console.log(body);
                    }
                    let ret = {
                        'accessToken' : body.access_token,
                        'expiresIn' : body.expires_in, // num seconds 
                        'refreshToken' : body.refresh_token // for getting new tokens
                    };

                    resolve(ret);
                });
    
            });    


        
        });
    };

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

            post(call, (response, body, error) => {
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
