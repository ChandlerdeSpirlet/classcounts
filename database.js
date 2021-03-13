var pgp = require('pg-promise')();


const connectionConf = {
  url: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized : false,
}

};
var db = pgp(connectionConf);


//var dbConfig = process.env.DATABASE_URL;

//var db = pgp(dbConfig);

module.exports = db;
