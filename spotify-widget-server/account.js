const path = require('path');
const User = require('./user');
const directory = path.resolve(__dirname, '.', 'public');
module.exports = function(app, request) {
    app.get('/login', (req, res) => {
        
        res.sendFile('login.html',{root: directory}, (err) => {
            res.send(err);
        })
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
                console.log(body.sub);
                req.session.userID = body.sub;
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
            res.send(err);
        })
    })
};