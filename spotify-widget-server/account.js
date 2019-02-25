
const User = require('./user');
const UserInfoInterface = require('./userInfoInterface');
const request = require('request');


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
                        if (user) {
                            
                            if (user.SpotifyAuth){
                                // also is connected to spotify!
                                res.redirect(`/timemachine`);
                            } else {
                                // redirect to connect to Spotify
                                res.redirect('/authorize');
                            }
                        } else {
                            // user is not in db - destroy session and log in again

                            req.session.destroy();
                            res.redirect('/login');
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
                res.redirect('/public/login.html');
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
            body = JSON.parse(body);
            if (body.sub) {
                // token is good
                
                // req.session.userID = body.sub; this is probably insecure. Use ID Token instead
                req.session.idtoken = req.body.idtoken; // used for future auth requests

                // if user does not already exist, add user to db
                UserInfoInterface.getUserByGoogleAuthToken(req.session.idtoken)
                    .then((user) => {
                        if (!user) {
                            UserInfoInterface.addUser(new User({"userID" : body.sub}));
                        }
                    });
                res.send(body.sub);

            } else {
                // something went wrong
                res.send({'err' : 'Didn\'t recieve user id from Google auth api'});
            }
        });

    };

    this.logoutGET = (req, res) => {
        req.session.destroy();
        res.redirect('/public/logout.html');

    };


    this.checkAuth = (session) => {
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

    this.getIDFromAuthToken = (authToken) => {
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