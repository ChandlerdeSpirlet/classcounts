require('newrelic');
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
    var http = require("http");
    setInterval(function() {
        http.get("http://classcounts.herokuapp.com");
    }, 300000); // every 5 minutes (300000)
    
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