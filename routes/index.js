//require('newrelic');
var express = require('express');
var db = require('../database');
var app = express();
module.exports = app;

var query = 'select * from "refresh"';
db.any(query)
    .then(function(data){
        var temp = data[0];
        global.globalDate = temp.refreshed;
});



app.get('/', function (request, response) {
    console.log("req.headers[x-forwarded-proto = " + request.headers['x-forwarded-proto']);
    if(request.headers['x-forwarded-proto']!='https'){
        response.redirect('https://classcounts.herokuapp.com')
    } else {
        var query = 'SELECT * FROM counts order by bbname';
    //var query = 'select Z.*, S.mon, S.tues, S.wed, S.thurs, S.fri from counts Z, signup S where Z.bbname like S.bbname';
        getDate();
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
    }
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    
    
});