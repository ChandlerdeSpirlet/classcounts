//require('newrelic');
var express = require('express');
const db = require('./database');
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
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method
    }
}));

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
    cookie: {maxAge: 8 * 60 * 1000}
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