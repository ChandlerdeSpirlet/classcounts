var express = require('express');
var db = require('../database');
var app = express();
var busboy = require('connect-busboy');
var path = require('path');
var fs = require('fs');
let fastcsv = require('fast-csv');
var nodemailer = require('nodemailer');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var exp_val = require('express-validator');


module.exports = app;
app.use(cookieParser('counts'));
app.use(session({
    secret: 'counts',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 3 * 60 * 1000} //3 minute cookie
}));
app.use(exp_val());
app.use(busboy());
app.use(express.static(path.join(__dirname, 'store')));

function getDate() {
    var query = 'select * from "refresh"';
    db.any(query)
        .then(function(data){
            var temp = data[0];
            global.globalDate = temp.refreshed;
        })
}
function getVersion() {
    var query = 'select * from changelog order by ver desc';
    db.any(query)
        .then(function(data){
            var version = data[0];
            global.versionGlobal = version.ver;
            console.log('in function - global.versionGlobal -', global.versionGlobal);
        })
}

app.get('/', function (request, response) {
    
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    var query = 'SELECT * FROM counts order by bbname';
    getDate();
    db.any(query)
        .then(function (rows) {
        // render views/store/list.ejs template file
        response.render('store/home', {
            title: 'Black Belt Class Counts' + '\n' + 'Updated - ' + global.globalDate,
            data: rows
        })
    })
    .catch(function (err) {
        // display error message in case an error
        request.flash('error', err);
        response.render('store/home', {
            title: 'Black Belt Class Counts' + '\n' + 'Updated - ' + global.globalDate,
            data: ''
        })
    })
    
});
app.get('/list2', function (request, response) {
    
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    if(!request.session.user){
        request.flash('error', 'Login credentials required');
        getDate();
        var query = 'SELECT * FROM counts order by bbname';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else {
        getDate();
        var query = 'SELECT * FROM counts order by bbname';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/list2', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/list2', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    }
});
app.get('/list3', function (request, response) {
    if (!request.session.user){
        request.flash('error', 'Login credentials required');
        getDate();
        // TODO: Initialize the query variable with a SQL query
        // that returns all the rows and columns in the 'store' table
        
        var query = 'SELECT * FROM counts order by bbname';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Class Counts - Updated ' + globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + globalDate,
                data: ''
            })
        })
    } else {
        getDate();
        // TODO: Initialize the query variable with a SQL query
        // that returns all the rows and columns in the 'store' table
        
        var query = 'SELECT * FROM counts order by bbname';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/list3', {
                title: 'Class Counts - Updated ' + globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/list3', {
                title: 'Class Counts - Updated ' + globalDate,
                data: ''
            })
        })
    }
});

app.get('/file', function (request, response) {
    // render the views/index.ejs template file
    if (!request.session.user){
        request.flash('error', 'Login credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
    })
    } else {
        response.render('store/file', {title: 'Add Class File'})
    }
});

function readData(area){
    var query = 'update "refresh" set refreshed = To_char(NOW() :: DATE, \'Mon dd, yyyy\')';
    db.none(query);
    let readableStreamInput = fs.createReadStream(area);
    let csvData = [];
    fastcsv
        .fromStream(readableStreamInput, {headers: false})
        .on('data', (data) => {
            let rowData = {};

            Object.keys(data).forEach(current_key => {
                rowData[current_key] = data[current_key]
            });
            csvData.push(rowData);
        }).on('end', () => {
            for (var x = 2; x < csvData.length; x++){
                if (csvData[x][2] == 'SWAT'){
                    db.none('update counts set swats = (swats + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Black Belt'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Level 3'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Lvl 3/Prep/Cond'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Prep/Cond'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Spar-3/Prep/Cond/Black'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Spar-Cond/Black'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Spar-Level 3'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Women\'s Sparring'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
            }
        })
};

function refresh(){
    var deleteQuery = 'update counts set regular = 0, sparring = 0, swats = 0 where barcode > 0';
    db.none(deleteQuery)
};

app.route('/file').post(function(req, res, next) {
    var fstream;
    req.pipe(req.busboy);
    refresh();
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        //Path where image will be uploaded
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {    
            console.log("Upload Finished of " + filename);  
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd = '0'+dd
            } 

            if(mm<10) {
                mm = '0'+mm
            } 

            today = mm + '/' + dd + '/' + yyyy; 
            req.flash('success', 'Classes added!');
            res.redirect('list2');        //where to go next
            readData(__dirname + '/files/' + filename);
        });
    });
});
app.get('/logout', function(req, res){
    req.session = null;
    res.redirect('home.ejs');
});
app.get('/changelog', function(req, res){
    if (!req.session.user || req.session.user != 'admin'){
        req.flash('error', 'Admin credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else if (req.session.user == "admin"){
        var query = 'SELECT * FROM changelog order by ver desc';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/changelog', {
                title: 'Changelog',
                version: '',
                date: '',
                change: '',
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/changelog', {
                title: 'Change Log',
                version: '',
                date: '',
                change: '',
                data: ''
            })
        })
    } else {
        req.flash('error', 'Admin credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    }
});
app.post('/changelog', function(req, res){
    req.assert('version', 'Version is required').notEmpty();
    req.assert('date', 'Date is required').notEmpty();
    req.assert('change', 'Change is required').notEmpty();

    var errors = req.validationErrors();
    if (!errors){
        var item = {
            version: req.sanitize('version').trim(),
            date: req.sanitize('date').trim(),
            change: req.sanitize('change').trim()
        };
        db.none('insert into changelog (ver, date, changes) values ($1, $2, $3)', [item.version, item.date, item.change])
        .then(function(res){
            res.redirect('changelog');
        }).catch(function(err){
            res.redirect('changelog');
        })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        req.flash('error', error_msg);
        res.render('store/changelog', {
            title: 'Change Log',
            version: req.body.version,
            date: req.body.date,
            change: req.body.change, 
            data: ''
        })
    }
});

app.get('/login', function(req, res){
    res.render('store/login', {
        title: 'Login',
        bbuser: '',
        bbpass: ''
    })
});
app.get('/login2', function(req, res){
    if (!req.session.user){
        req.flash('error', 'Login credentials required');
        rres.render('store/login', {
            title: 'Login',
            bbuser: '',
            bbpass: ''
        })
    } else {
        res.render('store/login2', {
            title: 'Login',
            bbuser: '',
            bbpass: ''
        })
    }
});

app.post('/login', function(request, response){
    request.assert('bbuser', 'Username is required').notEmpty();
    request.assert('bbpass', 'Password is required').notEmpty();

    var errors = request.validationErrors();
    if (!errors){
        var item = {
            bbuser: request.sanitize('bbuser').trim(),
            bbpass: request.sanitize('bbpass').trim()
        };
        db.func('checkuser', [item.bbuser, item.bbpass])
            .then( data => {
                var temp = data[0];
                var final = temp.checkuser;
                if (final == true && item.bbuser == "admin"){
                    request.session.user = item.bbuser;
                    request.flash('success', 'Admin credentials accepted!');
                    response.redirect('list3');
                }
                if (final == true){
                    request.session.user = item.bbuser;
                    request.flash('success', 'Login credentials accepted!');
                    response.redirect('list2'); ///store/login2
                } else {
                    request.flash('error', 'Login credentials rejected! Contact system admin if this is an issue.');
                    response.redirect('/store/login');
                }
            })
    }
});

app.get('/edit', function (request, response) {
    // render views/store/add.ejs
    if (!request.session.user){
        request.flash('error', 'Login credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else {
        response.render('store/edit', {
            title: 'Update Classes',
            barcode: '',
            reg: '',
            spar: '',
            swat: ''
        })
    }
});
app.post('/edit', function (request, response) {
    // Validate user input - ensure non emptiness
    request.assert('barcode', 'Barcode is required').notEmpty();
    request.assert('reg', 'Regular is required').notEmpty();
    request.assert('spar', 'Sparring is required').notEmpty();
    request.assert('swat', 'SWATs is required').notEmpty();

    var errors = request.validationErrors();
    if (!errors) { // No validation errors
        var item = {
            // sanitize() is a function used to prevent Hackers from inserting
            // malicious code(as data) into our database. There by preventing
            // SQL-injection attacks.
            barcode: request.sanitize('barcode').escape().trim(),
            reg: request.sanitize('reg').escape().trim(),
            spar: request.sanitize('spar').escape().trim(),
            swat: request.sanitize('swat').escape().trim()
        };
        // Running SQL query to insert data into the store table
        db.none('update counts set regular = $2, sparring = $3, swats = $4 where barcode = $1', [item.barcode, item.reg, item.spar, item.swat])
            .then(function (result) {
                request.flash('success', 'Classes changed successfully!');
                // render views/store/add.ejs
                response.render('store/edit', {
                    title: 'Update Classes',
                    barcode: '',
                    reg: '',
                    spar: '',
                    swat: ''
                })
            }).catch(function (err) {
            request.flash('error', err);
            // render views/store/add.ejs
            response.render('store/edit', {
                title: 'Update Classes',
                barcode: item.barcode,
                reg: item.reg,
                spar: item.spar,
                swat: item.swat
            })
        })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        request.flash('error', error_msg);
        response.render('store/edit', {
            title: 'Update Classes',
            barcode: request.body.barcode,
            reg: request.body.reg,
            spar: request.body.spar,
            swat: request.body.swat
        })
    }
});

app.get('/add', function (request, response) {
    // render views/store/add.ejs
    if (!request.session.user){
        request.flash('error', 'Login credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else {
        response.render('store/add', {
            title: 'Add New Blackbelt',
            barcode: '',
            bbname: ''
        })
    }
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

app.get('/email', function (request, response) {
    // render views/store/add.ejs
    response.render('store/email', {
        title: 'Contact Us',
        name: '',
        email: '',
        text: ''
    })
});
app.post('/email', function (request, response) {
    // Validate user input - ensure non emptiness
    request.assert('name', 'Name is required').notEmpty();
    request.assert('email', 'Email is required').notEmpty();
    request.assert('text', 'Response is required.').notEmpty();

    var errors = request.validationErrors();
    if (!errors){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'classcountsema@gmail.com',
                pass: 'novnap-hizcaf-rimGi7'
            }
        });
        var item = {
            name: request.sanitize('name').escape().trim(),
            email: request.sanitize('email').escape().trim(),
            text: request.sanitize('text').escape().trim()
        };
        version = getVersion();
        var opening = 'Version: ' + global.versionGlobal  + '\n' + 'Name: ' + item.name + '\n' + 'email: ' + item.email + '\n' + 'Problem: ' + item.text;
        var mailOptions = {
            from: 'classcountsema@gmail.com',
            to: 'chandler.despirlet@icloud.com',
            subject: 'Class Counts form submission',
            text: opening
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error){
                console.log(error);
                request.flash('error', 'Your response has not been sent!');
                response.redirect('email');
            } else {
                console.log('Email sent: ' + info.response);
                request.flash('success', 'Your response has been sent!');
                response.redirect('email');
            }
        });
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        request.flash('error', error_msg);
        response.render('store/email', {
            title: 'Contact Us',
            name: request.body.barcode,
            email: request.body.reg,
            text: request.body.spar
        })
    }
});
app.get('/email2', function (request, response) {
    // render views/store/add.ejs
    if (!request.session.user){
        request.flash('error', 'Login credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            response.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            request.flash('error', err);
            response.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else {
        response.render('store/email2', {
            title: 'Contact Us',
            name: '',
            email: '',
            text: ''
        })
    }
});
app.post('/email2', function (request, response) {
    // Validate user input - ensure non emptiness
    request.assert('name', 'Name is required').notEmpty();
    request.assert('email', 'Email is required').notEmpty();
    request.assert('text', 'Response is required.').notEmpty();

    var errors = request.validationErrors();
    if (!errors){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'classcountsema@gmail.com',
                pass: 'novnap-hizcaf-rimGi7'
            }
        });
        var item = {
            name: request.sanitize('name').escape().trim(),
            email: request.sanitize('email').escape().trim(),
            text: request.sanitize('text').escape().trim()
        };
        version = getVersion();
        var opening = 'Version: ' + global.versionGlobal + '\n' + 'Name: ' + item.name + '\n' + 'email: ' + item.email + '\n' + 'Problem: ' + item.text;
        var mailOptions = {
            from: 'classcountsema@gmail.com',
            to: 'chandler.despirlet@icloud.com',
            subject: 'Class Counts form submission - Logged In',
            text: opening
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error){
                console.log(error);
                request.flash('error', 'Your response has not been sent!');
                response.redirect('email2');
            } else {
                console.log('Email sent: ' + info.response);
                request.flash('success', 'Your response has been sent!');
                response.redirect('email2');
            }
        });
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        request.flash('error', error_msg);
        response.render('store/email2', {
            title: 'Contact Us',
            name: request.body.barcode,
            email: request.body.reg,
            text: request.body.spar
        })
    }
});

app.get('/del', function(req, res){
    if (!req.session.user){
        req.flash('error', 'Login credentials required');
        var query = 'SELECT * FROM counts order by bbname';
        getDate();
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/home', {
                title: 'Blackbelt Class Counts - Updated ' + global.globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/home', {
                title: 'Class Counts - Updated ' + global.globalDate,
                data: ''
            })
        })
    } else {
        res.render('store/del', {
            title: 'Remove Blackbelt',
            barcode : '',
            bbname: ''
        })
    }
});
app.post('/del', function(req, res){
    req.assert('barcode', 'Barcode is required to prevent mistakes.').notEmpty();
    var item = {
        barcode: req.sanitize('barcode').escape(),
        bbname: req.sanitize('bbname').escape()
    };
    var errors = req.validationErrors();
    if (!errors){
        db.none('delete from counts where (barcode = $1) or (bbname = $2)', [item.barcode, item.bbname])
        .then(function(result){
            if (item.bbname != ""){
                req.flash('success', item.bbname, ' (' + item.barcode + ') ', 'has been removed.');
                res.redirect('list2');
            } else {
                req.flash('success', item.barcode, item.bbname, ' has been removed.');
                res.redirect('list2');
            }
            
        }).catch(function(err){
            req.flash('error', err, ' blackbelt could not be removed');
            res.redirect('list2');
        })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        req.flash('error', error_msg);
        res.render('store/del', {
            title: 'Remove Blackbelt',
            barcode: req.body.barcode,
            bbname: req.body.bbname
        })
    }
});

app.delete('/delete', function (req, res) {
    var deleteQuery = 'update counts set regular = 0, sparring = 0, swats = 0 where barcode > 0';
    db.none(deleteQuery)
        .then(function (result) {
                    req.flash('success', 'Successfully refreshed classes');
                    res.redirect('file');
        })
        .catch(function (err) {
                    req.flash('error', err);
                    res.redirect('file');
        })
});