
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();
const port = 6001;

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.listen(port, () => {
    console.log(`server listening on ${port}`);
});

const request = require('request');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/table', (req, res) => {
    let obj = {
        fields: [
            "field1",
            "field2"
        ],
        data: [
            {
                field1: "text1",
                field2: "text2"
            },
            {
                field1: "text3",
                field2: "text4"
            },
            {
                field1: "text5",
                field2: "text6"
            }
        ]
    };
    res.render('table', obj);
})

