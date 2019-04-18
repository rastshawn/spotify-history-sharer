//const base64 = require('base-64'); // required for combining client secret and id for spotify auth

const request = require('request');

function getExpiryDate(expiresIn) {
    // return the actual date/time the token expires.
    // expiresIn, from spotify, is number of seconds until it expires.
    return new Date(Date.now() + expiresIn*1000);
}

// class variables
let app;

let currentCode;

class ImplicitGrant {
    
 
    constructor(expressApp){
       
        app = expressApp;

    };


    static getCode() {
        return new Promise((resolve, reject) => {
            if (currentCode && currentCode.expiresAt > Date.now()){
                resolve(currentCode.code);
            } else {
                return this.saveServerAuthCode();
            }
        });
    }


        // this is the callback from spotify
    
    static saveServerAuthCode() {


        // get token
        let call = {
            //method: 'post',
            url : 'https://accounts.spotify.com/api/token',
            headers: {
                'Authorization' : 'Basic ' + (new Buffer(app.clientID + ':' + app.clientSecret).toString('base64'))
            },
            form: {
                'grant_type': 'client_credentials'
            },
            json: true
        };
        
        return new Promise((resolve, reject) => {
            // this call back to Spotify, with the access code
            request.post(call, (err, httpResponse, body) => {
                if (err) {
                    console.log(err);
                    reject(err);
                    console.error(err);
                    return;
                    //todo
                } 
                currentCode = {
                    'code' : body.access_token,
                    'expiresAt' : getExpiryDate(body.expires_in)
                };

                resolve(currentCode.code);

                
            });
        });

    };       
 
};

module.exports = ImplicitGrant;
