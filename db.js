const pg = require('pg');

const Pool = pg.Pool;

const pool = new Pool(
    {
        user : "postgres",
        password: "o547988633",
        host:"localhost",
        post:5432,
        database: "sessionsandcookies"
    }
)

pool.connect(() =>{
    console.log("connected to the database");
})

pool.on('error' , (err) =>{
    console.err = err.message;
    throw err;
})

module.exports = pool;