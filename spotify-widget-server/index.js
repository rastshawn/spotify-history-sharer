
const express = require('express');
const session = require('express-session');
const app = express();
const port = 6001;

app.host = 'http://preznix.shawnrast.com:' + port;
app.clientID = '';
app.clientSecret = '';

app.sessionSecret = '';

class Arg {
    constructor(argName, variableName, bindVariable) {
        this.argName = argName;
        this.variableName = variableName;
        this.bindVariable = bindVariable;
        
        this.fulfilled = false;
    }

    bind(valueString) {
        let value = valueString.substr(this.argName.length);
        this.bindVariable[this.variableName] = value;
        this.fulfilled = true;
    };
}

let dbCreds = {};

let args = [
    new Arg('clientID', 'clientID', app),
    new Arg('secret', 'clientSecret', app),
    new Arg('session', 'sessionSecret', app),
    new Arg('testID', 'testID', app),
    new Arg('dbUser', 'username', dbCreds),
    new Arg('dbPass', 'password', dbCreds)
];



args.forEach((argObj) => {
    process.argv.forEach((arg) => {
        if (arg.indexOf(argObj.argName) > -1){
            argObj.bind(arg);
        }
        
    });

    if (!argObj.fulfilled) {
       // app.close();
       console.log(`${argObj.argName} must be passed`);
       process.exit();
    }
});

/*
if (!app.clientSecret || !app.clientID || !app.sessionSecret) {
    console.log("You must specify a clientID, clientSecret, and session secret.")
    console.log("nodejs index.js clientID=asfeijklsfe secret=sefjklfesjkl session=asdfjkles");
    // TODO combine this function with the above function that parses launch arguments
    // print the missing arg
    process.exit();
}
*/

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