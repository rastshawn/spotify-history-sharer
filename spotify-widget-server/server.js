const account = new (require('./account'))();
const templateObjectBuilder = require('./templateObjectBuilder');
const UserInfoInterface = require('./userInfoInterface');
const spotifyInterface = new (require('./spotifyInterface'))();
const OAuth = require('./oauth');


module.exports = function(app) {

    // App Login links (and Google login)
    app.get('/login', (req, res) => {
        account.loginGET(req, res, app);
    });
    app.post('/login', (req, res) => {
        account.loginPOST(req, res, app);
    });

    app.get('/logout', (req, res) => {
        account.logoutGET(req, res);
    });

    // Spotify OAuth links
    app.get('/authorize', (req, res) => {
        OAuth.authorize(req, res);
    });

    app.get('/saveCode', (req, res) => {
        OAuth.saveCode(req, res);
    });








    app.get('/users/:userID/last50', (req, res) => {

        UserInfoInterface.getUserByGoogleID(req.params.userID)
            .then(spotifyInterface.getLast50Songs)
            .then((response) => {
                return templateObjectBuilder.last50(response);
            }).then((response) => {

                let hbs = Object.assign(response, {layout: false});

                res.render('table', hbs);
            })
            .catch((err) => {
                console.log(err);
                res.send("Something went wrong.");
            });
    });

    app.get('/users/:userID/last50RAW', (req, res) => {

        UserInfoInterface.getUserByGoogleID(req.params.userID)
            .then(spotifyInterface.getLast50Songs)
            .then((response) => {
                res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.send("Something went wrong.");
            });
    });

    app.get('/users/:userID/history', (req, res) => {
        
        UserInfoInterface.getHistoryByGoogleID(req.params.userID)
            .then((response) => {
                //return templateObjectBuilder.history(response);
                let trackIDs = response.map((track) => {
                    return track.SpotifyTrackID;
                });
                return spotifyInterface.getTracksInfoBySpotifyTrackID(trackIDs).then((spotifyTrackInfo) => {
                    for (let i = 0; i<spotifyTrackInfo.length; i++){
                        spotifyTrackInfo[i].PlayedAt = response[i].PlayedAt;
                    }

                    return spotifyTrackInfo;
                });
            }).then(templateObjectBuilder.history).then((response) => {
                let hbs = Object.assign(response, {layout: false});
                res.render('table', hbs);
                //res.send(response);
            })
            .catch((err) => {
                console.log(err);
                res.send("Something went wrong.");
            });
    });
    


    app.get('/', (req, res) => {
        let hbs = {
            buttons: [
                {
                    id: "loginBtn",
                    text: "log in",
                    color: "red",
                    onclick: "window.location.href = '/login'"
                }
            ]
        }
        res.render('home', hbs);
    });
    
    app.get('/TimeMachine', (req, res) => {

        account.checkAuth(req.session)
            .then((userID) => {
                if (userID) {
                    let hbs = {
                        buttons: [
                            {
                                id: "accountBtn",
                                text: "my account",
                                color: "blue",
                                onclick: "window.location.href = '/account'"
                            },
                            {
                                id: "logoutBtn",
                                text: "log out",
                                color: "red",
                                onclick: "window.location.href = '/logout'"
                            }
                        ],
                        userID : userID
                    };

                    res.render('timemachine', hbs);
                } else {
                    // not logged in
                    req.session.destroy();
                    res.redirect('/login');
                }
            });

            app.get('/account', (req, res) => {
                res.send('To delete your account, email rastshawn@gmail.com');
            });

        

    })



    
}