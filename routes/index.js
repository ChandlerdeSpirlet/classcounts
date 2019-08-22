var express = require('express');
var db = require('../database');
const bodyParser = require('body-parser');
const cors = require('cors');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
module.exports = app;

const getData = (req, res) => {
    db.query('SELECT bbname, barcode from counts', (error, results) => {
        if (error){
            throw error
        }
        res.status(200).json(results.view)
    })
}

app
    .route('/getData')
    .get(getData)

var query = 'select * from "refresh"';
db.any(query)
    .then(function(data){
        var temp = data[0];
        global.globalDate = temp.refreshed;
});

app.get('/', function (request, response) {

    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    var query = 'SELECT * FROM counts order by bbname';

    db.any(query)
        .then(function (rows) {
        // render views/store/list.ejs template file
        response.render('store/home', {
            title: 'Updated - ' + global.globalDate,
            result: '',
            data: rows
        })
    })
    .catch(function (err) {
        // display error message in case an error
        request.flash('error', err);
        response.render('store/home', {
            title: 'Updated - ' + global.globalDate,
            result: '',
            data: ''
        })
    })
});