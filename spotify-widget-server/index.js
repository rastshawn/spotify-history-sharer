
const express = require('express');
const app = express();
const port = 6001;

app.listen(port, () => {
    console.log(`server listening on ${port}`);
});



const request = require('request');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());


const rp = require('request-promise');

app.host = 'http://preznix.shawnrast.com:' + port;
app.clientID = '';
app.clientSecret = '';

process.argv.forEach((arg) => {
    if (arg.indexOf('clientID') > -1){
        app.clientID = arg.substr(9);
    } else if (arg.indexOf('secret') > -1){
        app.clientSecret = arg.substr(7);
    }
});

if (!app.clientSecret || !app.clientID) {
    console.log("You must specify a clientID and clientSecret.")
    console.log("nodejs index.js clientID=asfeijklsfe secret=sefjklfesjkl");
    process.exit();
}



test();

function test() {
    let oauth = new (require('./oauth'))(app, request);

    oauth.getAuthToken().then((response) => {
        console.log(response);
    });
};