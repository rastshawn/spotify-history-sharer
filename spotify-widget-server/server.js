const account = new (require('./account'))();
const templateObjectBuilder = require('./templateObjectBuilder');
const UserInfoInterface = require('./userInfoInterface');
const spotifyInterface = new (require('./spotifyInterface'))();
const OAuth = require('./oauth');


module.exports = function(app) {
    app.get('/login', (req, res) => {
        account.loginGET(req, res, app);
    });
    app.post('/login', (req, res) => {
        account.loginPOST(req, res, app);
    });

    app.get('/logout', (req, res) => {
        account.logoutGET(req, res);
    });

    app.get('/users/:userID/last50', (req, res) => {

        UserInfoInterface.getUserByGoogleID(req.params.userID)
            .then(spotifyInterface.getLast50Songs)
            .then((response) => {

                let hbs = Object.assign(templateObjectBuilder.last50(response), {layout: false});

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
    
    app.get('/authorize', (req, res) => {
        OAuth.authorize(req, res);
    });

    app.get('/saveCode', (req, res) => {
        OAuth.saveCode(req, res);
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

        

    })



    
}