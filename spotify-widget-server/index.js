
const express = require('express');
const session = require('express-session');
const app = express();
const port = 6001;

app.host = 'http://preznix.shawnrast.com:' + port;
app.clientID = '';
app.clientSecret = '';

app.sessionSecret = '';

process.argv.forEach((arg) => {
    if (arg.indexOf('clientID') > -1){
        app.clientID = arg.substr(9);
    } else if (arg.indexOf('secret') > -1){
        app.clientSecret = arg.substr(7);
    } else if (arg.indexOf('session') > -1){
        app.sessionSecret = arg.substr(8);
    }
});


app.users = [];

app.use(session({
    secret: app.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        //secure: true // uncomment when running on https
    }
}));
app.listen(port, () => {
    console.log(`server listening on ${port}`);
});



const request = require('request');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());


const rp = require('request-promise');



if (!app.clientSecret || !app.clientID) {
    console.log("You must specify a clientID and clientSecret.")
    console.log("nodejs index.js clientID=asfeijklsfe secret=sefjklfesjkl");
    process.exit();
}

const spotifyInterface = new (require('./spotifyInterface'))(rp);

const accountManager = new (require('./account'))(app, request);



let oauth = new (require('./oauth'))(app, request);



app.get('/users/:userID/last50', (req, res) => {
    spotifyInterface.getLast50Songs(app.users[req.params.userID])
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            res.send(err);
        });
});