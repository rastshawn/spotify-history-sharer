
const express = require('express');
const session = require('express-session');
const app = express();
const port = 6001;

app.host = 'http://preznix.shawnrast.com:' + port;
app.clientID = '';
app.clientSecret = '';

app.sessionSecret = '';

class Arg {
    constructor(argName, variableName, bindVariable, optional) {
        this.argName = argName;
        this.variableName = variableName;
        this.bindVariable = bindVariable;
        this.optional = optional;
        
        this.fulfilled = false;
    }

    bind(valueString) {
        let value = valueString.substr(this.argName.length+1);
        this.bindVariable[this.variableName] = value;
        this.fulfilled = true;
    };
}

let dbCreds = {};

let args = [
    new Arg('clientID', 'clientID', app),
    new Arg('secret', 'clientSecret', app),
    new Arg('session', 'sessionSecret', app),
    new Arg('testID', 'testID', app, true),
    new Arg('dbUser', 'username', dbCreds),
    new Arg('dbPass', 'password', dbCreds)
];



args.forEach((argObj) => {
    process.argv.forEach((arg) => {
        if (arg.indexOf(argObj.argName) > -1){
            argObj.bind(arg);
        }
        
    });

    if (!argObj.fulfilled && !argObj.optional) {
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
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    user: dbCreds.username,
    password: dbCreds.password,
    database: 'TrackRecord', 
   // dateStrings: true
};

//const databaseConnection = mysql.createConnection(mysqlOptions);
const databaseConnection = mysql.createPool(mysqlOptions);
//databaseConnection.connect();

const database = new (require('./database'))(databaseConnection);
new (require('./userInfoInterface'))(database);
const sessionStore = new MySQLStore({
        // options, read here:
        // https://www.npmjs.com/package/express-mysql-session
		schema: {
			tableName: 'sessions',
			columnNames: {
				session_id: 'sessionID',
				expires: 'expires',
				data: 'data'
			}
		},
		charset: 'utf8mb4_bin',
		createDatabaseTable: true
    },
    databaseConnection);
app.use(session({
    secret: app.sessionSecret,
    resave: true,
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

const spotifyInterface = new (require('./spotifyInterface'))();

//const accountManager = new (require('./account'))(app, request);



let oauth = new (require('./oauth'))(app, request);

const server = require('./server')(app);
const UserInfoInterface = require('./userInfoInterface');
/*
app.get('/users/:userID/last50', (req, res) => {

    UserInfoInterface.getUserByGoogleID(req.params.userID)
        .then(spotifyInterface.getLast50Songs)
        .then((response) => {
            res.send(response);
        })
        .catch((err) => {
            res.send(err);
        });
});
*/



app.close = function(){
    sessionStore.close();
    // close db connections
    // close all active user sessions with messages
    // stop hosting
    
    process.exit();
};

const FDB = require('./fakeDatabase');
let fakedb = new FDB();
/*
const User = require('./user');
fakedb.addUser(new User({}));
*/

//const UserInfoInterface = new (require('./userInfoInterface'))(fakedb);
test();
function test() {
    
    app.get('/refresh', (req, res) => {
        let user = {};
        UserInfoInterface.getUserByGoogleAuthToken(req.session.idtoken)
            .then(oauth.renewToken)
            .then((user) => {
                res.send('Token refreshed');
            })
            .catch((err) => {
                console.log("err in renewing spotify token");
            });
    });
}
