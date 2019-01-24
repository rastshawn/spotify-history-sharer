module.exports = function (app, request) {
    this.getAuthToken = function() {
        
        let clientID = ''; // must be passed in
        let clientSecret = ''; // same
        let scope = 'user-read-recently-played';
        // for top add user-top-read with %20 as space
        // for currently playing add user-read-currently-playing
        let redirectURI = host + '/authorize';


        app.get('/authorize', (req, res) => {
            res.redirect('https://accounts.spotify.com/saveToken' +
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
                let url = '';
                let accessCode = '';
                
                if (url.indexOf('error') > 1) {
                    // figure out what to do if user denies application
                    // TODO
                }
                
                // get token
                let call = {
                    url : 'https://accounts.spotify.com/api/token',
                    headers: {
                        'Authorization' : 'Basic ' + base64ClientIDSecret(),
                        'type' : 'application/x-www-form-urlencoded'
                    },
                    body: {
                        'grant_type': 'authorization_code',
                        'code' : accessCode,
                        'redirect_uri' : redirectURI,
                    }
                };
                
    
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


        
        });
    };

    this.renewToken = function(refreshToken) {
        // call /api/token with refresh token

        let call = {
            url: 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization' : 'Basic ' + base64ClientIDSecret()
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
