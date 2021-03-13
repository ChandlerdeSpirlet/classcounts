//require('newrelic');
var express = require('express');
const db = require('/app/database');
var app = express();
app.set('view engine', 'ejs');
var expressValidator = require('express-validator');
app.use(expressValidator());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());
var multer = require('multer');
var multerupload = multer({dest: 'files/'})
var methodOverride = require('method-override');
const cron = require('node-cron');
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));


function getSid(callback){
    var acctSid = '';
    query = "select pass_key from secure_data where data_name = 'accountSid'";
    db.any(query, (err, res) => {
            var sid = res.rows[0];
            console.log("query is = " + query);
            console.log("data = " + '\n' + res);
            console.log("sid in getSid function in server = " + sid );
            acctSid = sid;
            callback(acctSid);
        })
        .catch (function(err){
            console.log("getSid ERROR: " + err);
        })
}
function getToken(callback){
    var authToken = '';
    query = "select pass_key from secure_data where data_name = 'authToken'";
    db.any(query, (err, res) => {
            var token = res.rows[0];
            authToken = token;
            callback(authToken);
        })
        .catch (function(err){
            console.log("getToken ERROR: " + err);
        })
    return authToken;
}

function sendMessage(text){
    getToken(function(result1){
        var authToken = result1;
        getSid(function(result2){
            var acctSid = result2;
            client = require('twilio')(acctSid, authToken);
            client.messages
            .create({
                body: text,
                from: '+19705172654',
                to: '+19703634895'
            })
            .then(message => console.log(message.sid));
        });
    });
}

cron.schedule("0 0 6 * * 6", function(){
    console.log("-----------------------------------");
    console.log("Clearing the log of non black belts");
    console.log("-----------------------------------");
    var query = "delete from log where barcode not in (select barcode from counts)";
    db.any(query)
        .then(function(){
            console.log("--------------------");
            console.log("Log has been cleared");
            console.log("--------------------");
            sendMessage("Log has been successfully cleared.");
        })
        .catch(function(err){
            console.log("ERROR in log clear: " + err);
            sendMessage("Log has not been successfully cleared.");
        })
});

const getData = (req, res) => {
    query = 'SELECT barcode, bbname, regular, sparring, swats FROM counts order by bbname';
    db.any(query)
        .then(function(rows){
            res.status(200).json(rows);
        })
        .catch(function(err){
            console.log("ERROR " + err);
        })
}
app
    .route('/data')
    .get(getData)
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser('count'));
app.use(session({
    secret: 'count',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60 * 60 * 1000}
}));
app.use(flash());
var index = require('./routes/index');
var store = require('./routes/store');
app.use('/', index);
app.use('/store', store);
//var port = 5000;
var port = process.env.PORT;


app.listen(port, function() {
    console.log('Server running on http://localhost:' + port)
});