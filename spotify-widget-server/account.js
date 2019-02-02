const path = require('path');
const User = require('./user');
const UserInfoInterface = require('./userInfoInterface');
const request = require('request');
const directory = path.resolve(__dirname, '.', 'public');
module.exports = function() {
    this.loginGET = (req, res) => {
        // check if user is already logged in
        // if so, check if spotify account is linked
        this.checkAuth(req.session).then((userID) => {
            
            if (userID) { 
                // user is logged in
                // but what about spotify? 
                console.log('user is logged in');
                UserInfoInterface.getUserByGoogleID(userID)
                    .then((user) => {
                        console.log(user);
                        if (user.SpotifyAuth){
                            // also is connected to spotify!
                            res.redirect(`/users/${userID}/last50`);
                        } else {
                            // redirect to connect to Spotify
                            res.redirect('/authorize');
                        }
                    }); // TODO catch block necessary?

               
            } else {
                // clear out session
                if (req.session.idtoken){
                    req.session.destroy();
                    res.redirect('/login');
                    return;
                }
                console.log("not logged in");
                res.sendFile('login.html',{root: directory}, (err) => {
                    if (err) {
                        res.send(err);
                    }
                })
            }
        });


    };

    this.loginPOST = (req, res) => {
        if (!req.body.idtoken) {
            res.send('error, no token');
        }

        request.get( {
            url: 'https://oauth2.googleapis.com/tokeninfo',
            qs: {
                'id_token' : req.body.idtoken
            }
        }, (err, httpResponse, body) => {
            console.log(body);
            body = JSON.parse(body);
            if (body.sub) {
                // token is good
                
                // req.session.userID = body.sub; this is probably insecure. Use ID Token instead
                req.session.idtoken = req.body.idtoken; // used for future auth requests
                UserInfoInterface.addUser(new User({"userID" : body.sub}));

                res.send(body.sub);

            } else {
                // something went wrong
                res.send({'err' : 'Didn\'t recieve user id from Google auth api'});
            }
        });

    };

    this.logoutGET = (req, res) => {
        req.session.destroy();
        res.sendFile('logout.html',{root: directory}, (err) => {
            if (err) {
                res.send(err);
            }
        })
    };


    this.checkAuth = function(session) {
        //console.log(session.idtoken);
        return new Promise((resolve, reject) => {
            if (!session.idtoken) {
                // user definitely not logged in
                console.log("no id token");
                resolve(false);
                return;
            }
    
            this.getIDFromAuthToken(session.idtoken)
                .then((response) => {
                    resolve(response);
                });
        });
    };

    this.getIDFromAuthToken = function(authToken) {
        //console.log(authToken);
        return new Promise((resolve, reject) => {
            request.get( {
                url: 'https://oauth2.googleapis.com/tokeninfo',
                qs: {
                    'id_token' : authToken
                }
            }, (err, httpResponse, body) => {
                
                if (err) {
                    reject(err);
                    return;
                }
                console.log(body);
                body = JSON.parse(body);
                if (body.sub) {
                    // token is good
                    resolve(body.sub);
    
                } else {
                    // something went wrong in authenticating
                    resolve(false);
                }
            });
        });
    };
};