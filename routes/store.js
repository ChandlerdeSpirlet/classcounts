var express = require('express');
var db = require('../database');
var app = express();

var fs = require('fs');
var csv = require('fast-csv');
const multer = require('multer');
const bodyParser = require('body-parser');
module.exports = app;



app.get('/', function (request, response) {
    
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    
    var query = 'SELECT * FROM counts';

    db.any(query)
        .then(function (rows) {
        // render views/store/list.ejs template file
        response.render('store/list', {
            title: 'Class Counts',
            data: rows
        })
    })
    .catch(function (err) {
        // display error message in case an error
        request.flash('error', err);
        response.render('store/list', {
            title: 'Class Counts',
            data: ''
        })
    })
    
});

app.get('/add', function (request, response) {
    // render views/store/add.ejs
    response.render('store/add', {
        title: 'Add New Blackbelt',
        barcode: '',
        bbname: ''
    })
});
app.post('/add', function (request, response) {
    // Validate user input - ensure non emptiness
    request.assert('barcode', 'Barcode is required').notEmpty();
    request.assert('bbname', 'Name is required').notEmpty();

    var errors = request.validationErrors();
    if (!errors) { // No validation errors
        var item = {
            // sanitize() is a function used to prevent Hackers from inserting
            // malicious code(as data) into our database. There by preventing
            // SQL-injection attacks.
            barcode: request.sanitize('barcode').escape().trim(),
            bbname: request.sanitize('bbname').escape().trim()
        };
        // Running SQL query to insert data into the store table
        db.none('INSERT INTO counts(barcode, bbname, regular, sparring, swats) VALUES($1, $2, $3, $4, $5)', [item.barcode, item.bbname, 0, 0, 0])
            .then(function (result) {
                request.flash('success', 'Blackbelt added successfully!');
                // render views/store/add.ejs
                response.render('store/add', {
                    title: 'Add New Blackbelt',
                    barcode: '',
                    bbname: ''
                })
            }).catch(function (err) {
            request.flash('error', err);
            // render views/store/add.ejs
            response.render('store/add', {
                title: 'Add New Blackbelt',
                barcode: item.barcode,
                bbname: item.bbname
            })
        })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        request.flash('error', error_msg);
        response.render('store/add', {
            title: 'Add New Blackbelt',
            barcode: request.body.barcode,
            bbname: request.body.bbname
        })
    }
});

app.use(bodyParser.json());
app.use('/', express.static('/ClassCounts' + '/public'));
const multerConfig = {
    storage: multer.diskStorage({
        destination: function(req, res, next){
            next(null, './public/class-storage');
        },
            filename: function(req, file, next){
                console.log(file);
                const ext = file.mimetype.split('/')[1];
                next(null, file.fieldname + '.' + ext);
            }
    }),
        fileFilter: function(req, file, next){
            if(!file){
                next();
            }
            const xport = file.mimetype.startsWith('csv/');
            if (csv){
                console.log('csv uploaded');
                next(null, true);
            } else {
                console.log("file not supported");
                return next();
            }
        }
}
app.upload('/upload', function(req, res){
    res.render('store/file');
});
app.post('/upload', multer(multerConfig).single('myFile'), function(req, res){
    res.send('Complete!');
});
app.delete('/delete', function (req, res) {
    var deleteQuery = 'update counts set regular = 0, sparring = 0, swats = 0 where barcode > 0';
    db.none(deleteQuery)
        .then(function (result) {
                    req.flash('success', 'Successfully refreshed classes');
                    res.redirect('/store');
        })
        .catch(function (err) {
                    req.flash('error', err);
                    res.redirect('/store')
        })
});
