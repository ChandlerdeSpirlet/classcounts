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
    cookie: {maxAge: 8 * 60 * 1000} //8 minute cookie
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
    getVersion();
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    var query = 'SELECT * FROM counts order by bbname';
    //var query = 'select Z.*, S.mon, S.tues, S.wed, S.thurs, S.fri from counts Z, signup S where Z.bbname like S.bbname';
    getDate();
    db.any(query)
        .then(function (rows) {
        // render views/store/list.ejs template file
        console.log('rows: \n', rows);
        response.render('store/home', {
            title: 'Updated - ' + global.globalDate,
            data: rows
        })
    })
    .catch(function (err) {
        // display error message in case an error
        request.flash('error', err);
        response.render('store/home', {
            title: 'Updated - ' + global.globalDate,
            data: ''
        })
    })
    
});
app.get('/schedule', function (req, res){
    var data =fs.readFileSync(__dirname + '/storedFiles/sched.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/ITP', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/ITP.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/aspHomework', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/ASPhomework.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Lvl1Homework', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Lvl1Homework.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Lvl2Homework', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Lvl2Homework.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Lvl3Homework', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Lvl3Homework.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/BBHomework', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/BBHomework.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Lvl1Sparring', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Lvl1Sparring.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Lvl2Sparring', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Lvl2Sparring.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/ASPPacket', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/ASPPacket.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/Calendar', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/Calendar.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/1Confidence', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/1Confidence.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/2Discipline', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/2Discipline.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/3Respect', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/3Respect.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/4Responsibility', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/4Responsibility.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/5Focus', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/5Focus.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/6GoalSetting', function(req, res){
    var data = fs.readFileSync(__dirname + '/storedFiles/6GoalSetting.pdf');
    res.contentType("application/pdf");
    res.send(data);
});
app.get('/test', function(request, response){
    getVersion();
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    var query = 'SELECT * FROM counts order by bbname';
    getDate();
    db.any(query)
        .then(function (rows) {
        // render views/store/list.ejs template file
        response.render('store/test', {
            title: 'Black Belt Class Counts' + '\n' + 'Updated - ' + global.globalDate,
            data: rows
        })
    })
    .catch(function (err) {
        // display error message in case an error
        request.flash('error', err);
        response.render('store/test', {
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
function addUpdate(){
    var query = 'select * from inc'
    db.any(query)
        .then(function(rows) {
            for (var x = 0; x < rows.length; x++){
                var code = rows[x].barcode;
                var reg = rows[x].regular;
                var spar = rows[x].sparring;
                var swat = rows[x].swat;
                var dbQ = 'update counts set regular = ($1 + regular), sparring = ($2 + sparring), swats = ($3 + swats) where barcode = $4';
                db.none(dbQ, [reg, spar, swat, code]);
            }
            console.log("DONE");
        })
        .catch(function(err){
            console.log("In the function .catch", err);
        })
};

function readData(area){
    var options = {
        timeZone: "America/Denver",
        year: 'numeric', month: 'long', day: 'numeric'
    };
    var option2 = {
        timeZone: "America/Denver",
        hour: 'numeric', minute: 'numeric'
    };
    var formatter = new Intl.DateTimeFormat('en-us', options);
    var localTime = formatter.format(new Date());
    var form = new Intl.DateTimeFormat('en-us', option2);
    var time = form.format(new Date());
    var combined = localTime + " at " + time;
    var query = 'update "refresh" set refreshed = $1';
    db.none(query, [combined]);
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
                if (csvData[x][2] == 'Basic'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Level 1'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Level 1/2'){
                    db.none('update counts set regular = (regular + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Level 2'){
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
                if (csvData[x][2] == 'Spar - Level 2'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
                if (csvData[x][2] == 'Women\'s Sparring'){
                    db.none('update counts set sparring = (sparring + 1) where barcode = ' + csvData[x][1]);
                }
            }
            addUpdate();
        })
};

function refresh(){
    var deleteQuery = 'update counts set regular = 0, sparring = 0, swats = 0 where barcode > 0';
    db.none(deleteQuery)
};

app.route('/file').post(function(req, res, next) {
    sendEmail(req.session.user);
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
function setBool(code){
    var query = 'update counts set additional = true where barcode = $1'
    db.none(query, code)
};
function clearBool(){
    var query = 'update counts set additional = false where barcode > 0'
    db.none(query)
};
app.get('/additional', function(req, res){
    if (!req.session.user || req.session.user != 'admin'){
        req.flash('error', 'Admin credentials required');
        var query = 'SELECT * FROM inc order by bbname';
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
        var query = 'SELECT * FROM inc order by bbname';
        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/additional', {
                title: 'Stored Classes',
                bbname: '',
                barcode: '',
                regular: '',
                spar: '',
                swat: '',
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/additional', {
                title: 'Stored Classes',
                bbname: '',
                barcode: '',
                regular: '',
                spar: '',
                swat: '',
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
app.post('/additionalADD', function(req, res){
    req.assert('bbname', 'Name is required').notEmpty();
    req.assert('barcode', 'Barcode is required').notEmpty();
    req.assert('regular', 'Regular is required').notEmpty();
    req.assert('spar', 'Sparring is required').notEmpty();
    req.assert('swat', 'Swats is required').notEmpty();

    var errors = req.validationErrors();
    if (!errors){
        var item = {
            bbname: req.sanitize('bbname').trim(),
            barcode: req.sanitize('barcode').trim(),
            regular: req.sanitize('regular').trim(),
            spar: req.sanitize('spar').trim(),
            swat: req.sanitize('swat').trim()
        };
        setBool(item.barcode);
        console.log('In post -', item.bbname, item.barcode, item.regular, item.spar, item.swat);
        db.none('insert into inc (barcode, bbname, regular, sparring, swat) values ($1, $2, $3, $4, $5)', [item.barcode, item.bbname, item.regular, item.spar, item.swat])
        .then(function(res){
            res.redirect('additional');
            console.log('Successful');
            req.flash('Added successfully');
        }).catch(function(err){
            console.log('Failed', err);
            res.redirect('additional');
            req.flash(err);
        })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        req.flash('error', error_msg);
        res.render('store/additional', {
            title: 'Stored Classes',
            bbname: req.body.bbname,
            barcode: req.body.barcode,
            regular: req.body.regular,
            spar: req.body.spar,
            swat: req.body.spar,
            data: ''
        })
    }
});
app.post('/additionalCLEAR', function(req, res){
    clearBool();
    db.none('delete from inc where barcode > -1')
        .then(function (res) {
            req.flash('success', 'Stored classes removed');
            res.redirect('additional');
    })
    .catch(function (err) {
            console.log('error', err);
            res.redirect('additional');
    })
});
app.get('/alter/(:barcode)', function(req, res) {
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
    }
    else if (req.session.user == "admin"){
        var code = req.params.barcode;
        console.log('code is ', req.params.barcode);
        var query = 'select * from inc where barcode = $1';
        db.one(query, code)
            .then(function (row) {
                if (row.length === 0){
                    req.flash('error', 'Black belt is not in this list');
                    res.redirect('additional');
                } else {
                    console.log('In the else for .get alter');
                    res.render('store/alter', {
                        title: 'Edit Classes',
                        bbname: row.bbname,
                        barcode: row.barcode,
                        regular: row.regular,
                        spar: row.sparring,
                        swat: row.swat                       
                    })
                    
                }
            })
            .catch(function (err) {
                console.log('In .catch err for alter barcode .get');
                req.flash('error', err);
                res.render('store/additional', {
                    title: 'Stored Classes',
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
app.put('/alter/(:barcode)', function (req, res) {
    req.assert('bbname', 'Name is required').notEmpty();
    req.assert('barcode', 'Barcode is required').notEmpty();
    req.assert('regular', 'Regular is required').notEmpty();
    req.assert('spar', 'Sparring is required').notEmpty();
    req.assert('swat', 'Swats is required').notEmpty();

    var errors = req.validationErrors();
    if (!errors){
        var item = {
            bbname: req.sanitize('bbname').escape().trim(),
            barcode: req.sanitize('barcode').escape().trim(),
            regular: req.sanitize('regular').escape().trim(),
            spar: req.sanitize('spar').escape().trim(),
            swat: req.sanitize('swat').escape().trim()
        };
        console.log('In the .put for alter');
        console.log(item.bbname, item.barcode, item.regular, item.spar, item.swat);
        db.none('update inc set bbname = $1, barcode = $2, regular = $3, sparring = $4, swat = $5 where barcode = $2', [item.bbname, item.barcode, item.regular, item.spar, item.swat])
            .then(function() {
                req.flash('success', 'Black belt classes updated.');
                console.log('In the .then for updateQuery');
                console.log('Testing redirect');
                getDate();
                // TODO: Initialize the query variable with a SQL query
                // that returns all the rows and columns in the 'store' table
                
                var query = 'SELECT * FROM counts order by bbname';

                db.any(query)
                    .then(function (rows) {
                    // render views/store/list.ejs template file
                    res.render('store/list3', {
                        title: 'Class Counts - Updated ' + globalDate,
                        data: rows
                    })
                })
                .catch(function (err) {
                    // display error message in case an error
                    req.flash('error', err);
                    res.render('store/list3', {
                        title: 'Class Counts - Updated ' + globalDate,
                        data: ''
                    })
                })
            })
            .catch(function(err) {
                console.log('In .catch err');
                req.flash('error', err);
                res.render('store/additional', {
                    title: 'Stored Classes',
                    bbname: req.body.bbname,
                    barcode: req.params.barcode,
                    regular: req.body.regular,
                    spar: req.body.spar,
                    swat: req.body.swat,
                    data: ''
                })
            })
    } else {
        var error_msg = errors.reduce((accumulator, current_error) => accumulator + '<br />' + current_error.msg, '');
        req.flash('error', error_msg);
        res.render('store/additional', {
            title: 'Stored Classes',
                bbname: req.body.bbname,
                barcode: req.body.barcode,
                regular: req.body.regular,
                spar: req.body.spar,
                swat: req.body.swat,
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
        res.render('store/login', {
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
app.get('/adminView', function(req, res){
    if (!req.session.user){
        req.flash('error', 'Login credentials required');
        getDate();
        // TODO: Initialize the query variable with a SQL query
        // that returns all the rows and columns in the 'store' table
        
        var query = 'SELECT * FROM counts order by bbname';

        db.any(query)
            .then(function (rows) {
            // render views/store/list.ejs template file
            res.render('store/home', {
                title: 'Class Counts - Updated ' + globalDate,
                data: rows
            })
        })
        .catch(function (err) {
            // display error message in case an error
            req.flash('error', err);
            res.render('store/home', {
                title: 'Class Counts - Updated ' + globalDate,
                data: ''
            })
        })
    } else {
        var query = 'select * from signup';
        db.any(query)
            .then(function(rows){
                res.render('store/adminView', {
                    title: 'Spring Break',
                    data: rows
                })
            })
            .catch(function (err){
                req.flash('error', err);
                res.render('store/adminView', {
                    title: 'Spring Break',
                    data: ''
                })
            })
        }
});
app.get('/signup', function(req, res){
    res.render('store/signup', {
        title: 'Spring Break Camp SWAT Signup',
        bbname: '',
        M: 'true',
        Tu: 'true',
        W: 'true',
        Th: 'true',
        F: 'true'
    })
});
app.post('/signup', function(req, res){
    req.assert('bbname', 'Name is required').notEmpty();
    var errors = req.validationErrors();
    if (!errors){
        var item = {
            bbname: req.sanitize('bbname').trim(),
            M: req.body.M,
            Tu: req.body.Tu,
            W: req.body.W,
            Th: req.body.Th,
            F: req.body.F
        }
        var days = [];
        console.log('testing days');
        if (item.M == 'true'){
            days.push(true);
        }
        else{
            days.push(false);
        }
        if (item.Tu == 'true'){
            days.push(true);
        }
        else{
            days.push(false);
        }
        if (item.W == 'true'){
            days.push(true);
        }
        else{
            days.push(false);
        }
        if (item.Th == 'true'){
            days.push(true);
        }
        else{
            days.push(false);
        }
        if (item.F == 'true'){
            days.push(true);
        }
        else{
            days.push(false);
        }
        console.log('days = ', days);
        db.none('insert into signup (bbname, mon, tues, wed, thurs, fri) values ($1, $2, $3, $4, $5, $6)', [item.bbname, days[0], days[1], days[2], days[3], days[4]])
            .then(function(result){
                function getDays(){
                    var temp = []
                    for (x = 0; x < days.length; x++){
                        if (days[x] == true){
                            if (x == 0){
                                temp.push('Monday');
                            }
                            if (x == 1){
                                temp.push('Tuesday');
                            }
                            if (x == 2){
                                temp.push('Wednesday');
                            }
                            if (x == 3){
                                temp.push('Thursday');
                            }
                            if (x == 4){
                                temp.push('Friday');
                            }
                        }
                    }
                    console.log('in db func, testing the temp array');
                    console.log('temp - ', temp);
                    return temp;
                }
                var temp = getDays();
                console.log('getDays - ', temp);
                req.flash(item.name, 'signed up to swat ', temp);
                res.redirect('/');
            }).catch(function(err){
                req.flash('error', err);
                res.render('store/signup', {
                    title: 'Spring Break Camp SWAT Signup',
                    bbname: '',
                    M: 'true',
                    Tu: 'true',
                    W: 'true',
                    Th: 'true',
                    F: 'true'
                })
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
function sendEmail(name){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'classcountsema@gmail.com',
            pass: 'novnap-hizcaf-rimGi7'
        }
    });
    var mailOptions = {
        from: 'classcountsema@gmail.com',
        to: 'chandler.despirlet@icloud.com',
        subject: 'New File Submitted',
        text: 'New file submitted on ' + getDate() + ' by ' + name
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error){
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
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