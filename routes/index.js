//require('newrelic');
var express = require('express');
const db = require('./database');
//var pgp = require('pg-promise')();

//var dbConfig = process.env.DATABASE_URL;
//var db = pgp(dbConfig);

//module.exports = db;
var app = express();
module.exports = app;

var query = 'select * from "refresh"';
db.any(query)
    .then(function(data){
        var temp = data[0];
        global.globalDate = temp.refreshed;
});


function getDate() {
    var query = 'select * from "refresh"';
    db.any(query)
        .then(function(data){
            var temp = data[0];
            global.globalDate = temp.refreshed;
        })
}

app.get('/', function (request, response) {
    response.redirect('https://classcounts.herokuapp.com/store/home')
    // TODO: Initialize the query variable with a SQL query
    // that returns all the rows and columns in the 'store' table
    
    
});