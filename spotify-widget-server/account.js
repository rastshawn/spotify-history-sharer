const path = require('path');
const User = require('./user');
const directory = path.resolve(__dirname, '.', 'public');
module.exports = function(app, request) {
    app.get('/login', (req, res) => {
        // check if user is already logged in
        // if so, check if spotify account is linked

        this.checkAuth(req.session).then((userID) => {
            if (userID) { 
                // user is logged in
                // but what about spotify? 

                if (app.users[userID].authObj){
                    // also is connected to spotify!
                    res.redirect(`/users/${userID}/last50`);
                } else {
                    // redirect to connect to Spotify
                    res.redirect('/authorize');
                }
            } else {
                res.sendFile('login.html',{root: directory}, (err) => {
                    if (err) {
                        res.send(err);
                    }
                })
            }
        });


    });

    app.post('/login', (req, res) => {
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
                app.users[body.sub] = new User({"userID" : body.sub});
                res.send(body.sub);

            } else {
                // something went wrong
                res.send({'err' : 'Didn\'t recieve user id from Google auth api'});
            }
        });

    });

    app.get('/logout', (req, res) => {
        req.session.destroy();
        res.sendFile('logout.html',{root: directory}, (err) => {
            if (err) {
                res.send(err);
            }
        })
    })


    this.checkAuth = function(session) {
        return new Promise((resolve, reject) => {
            if (!session.idtoken) {
                // user definitely not logged in
                resolve(false);
            }
    
            request.get( {
                url: 'https://oauth2.googleapis.com/tokeninfo',
                qs: {
                    'id_token' : session.idtoken
                }
            }, (err, httpResponse, body) => {
                if (err) {
                    reject(err);
                    return;
                }
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
    }
};