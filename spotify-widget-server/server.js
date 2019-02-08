const account = new (require('./account'))();
const makeEmbed = require('./makeEmbed');
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
                //console.log(response);
                let string = makeEmbed.getHTML(response);
                res.send(string);
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
                //console.log(response);
                //let string = makeEmbed.getHTML(response);
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

    
}