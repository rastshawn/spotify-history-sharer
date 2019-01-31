
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
    } else if (arg.indexOf('testID') > -1){
        app.testID = arg.substr(7);
    }

    // TODO rewrite this function
    // to create one that does this that takes an array of 
    // parameters to watch for

    // and closes the app if any one is absent
});

if (!app.clientSecret || !app.clientID || !app.sessionSecret) {
    console.log("You must specify a clientID, clientSecret, and session secret.")
    console.log("nodejs index.js clientID=asfeijklsfe secret=sefjklfesjkl session=asdfjkles");
    // TODO combine this function with the above function that parses launch arguments
    // print the missing arg
    process.exit();
}

const mysql = require('mysql');
const MySQLStore = require('express-mysql-session')(session);
let mysqlOptions = {
    host: 'localhost',
    port: 3306,
    user: 'username',
    password: 'password',
    database: 'soundtrack-journal'    
};

const databaseConnection = mysql.createConnection(mysqlOptions);
const sessionStore = new MySQLStore({
        // options, read here:
        // https://www.npmjs.com/package/express-mysql-session

    },
    databaseConnection);
app.use(session({
    secret: app.sessionSecret,
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: {
        //secure: true // uncomment when running on https
        // TODO set secure to true
    }
}));

app.users = [];

app.listen(port, () => {
    console.log(`server listening on ${port}`);
});



const request = require('request');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());


const rp = require('request-promise');




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



app.close = function(){
    sessionStore.close();
    // close db connections
    // close all active user sessions with messages
    // stop hosting
    
    process.exit();
};

test();
function test() {
    app.get('/refresh', (req, res) => {
        oauth.renewToken(app.users[app.testID].authObj.refreshToken).then((ret) => {
            //console.log(ret);
            res.send(ret);

            app.users[app.testID].authObj.accessToken = ret.accessToken;

        }).catch((err) => {
            console.log(err);
            res.send(ret);
        });
    });
}