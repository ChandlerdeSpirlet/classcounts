const Pool = require('pg').Pool
var dbConfig = process.env.DATABASE_URL;
const pool = new Pool(dbConfig);
const getUsers = (req, res) => {
    pool.query('select barcode, bbname, regular, sparring, swats from counts', (error, results) => {
        if (error){
            throw error
        }
        res.status(200).json(results.rows)
    })
}
module.exports = {
    getUsers
}