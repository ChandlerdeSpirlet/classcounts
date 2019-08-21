var db = require('../database');
const getUsers = (req, res) => {
    db.query('select barcode, bbname, regular, sparring, swats from counts', (error, results) => {
        if (error){
            throw error
        }
        res.status(200).json(results.rows)
    })
}
module.exports = {
    getUsers
}