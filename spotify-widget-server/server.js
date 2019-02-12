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
                res.render('table', templateObjectBuilder.last50(response));
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
            ]
        };

        res.render('timemachine', hbs);

    })



    
}