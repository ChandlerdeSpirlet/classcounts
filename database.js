/*
var pgp = require('pg-promise')();
const dbConfig = {
    host: 'ec2-54-243-46-32.compute-1.amazonaws.com',
    port: 5432, 
    database: 'dbt79su116s72i',
    user: 'mrnqvzklsflqnv',
    password: 'b7821f1347fb57793bbc79b5fb2834687243f2d67f8f7916875df31bb874f64a',
    ssl: true
};
var db = pgp(dbConfig);
module.exports = db;
*/
/*
var pgp = require('pg-promise')();

var dbConfig = process.env.DATABASE_URL;
var db = pgp(dbConfig);

module.exports = db;
*/
const {Pool} = require('pg');
const isProduction = process.env.NODE_ENV === 'production'
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction,
})

module.exports = {pool}