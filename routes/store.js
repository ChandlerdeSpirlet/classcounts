var express = require('express');
var db = require('../database');
var app = express();
var busboy = require('connect-busboy');
var path = require('path');
var fs = require('fs-extra');

module.exports = app;
app.use(busboy());
app.use(express.static(path.join(__dirname, 'store')));


app.get('/', function (request, response) {
    
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    
    var query = 'SELECT * FROM counts order by bbname';

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
app.get('/file', function (request, response) {
    // render the views/index.ejs template file
    response.render('store/file', {title: 'Add Class File'})
});
app.route('/file').post(function(req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename);              
            res.redirect('back');           //where to go next
        });
    });
    let csvStream = csv.fromPath(__dirname + '/files/', {headers: true})
        .on("data", function(record){
            csvStream.pause();
            let bb = record.Person;
            let code = record.Barcode;
            let type = record.Name;
            if (type == 'SWAT'){
                db.none('update counts set swat = (swat + 1) where barcode = $1', [code]);
            }
            csvStream.resume();
        }).on("end", function(){
            console.log("Job is done!");
        }).on("error", function(err){
            console.log("err");
        });
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
