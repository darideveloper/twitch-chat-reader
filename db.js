const dotenv = require("dotenv")
const { Pool } = require('pg')

// Load crdentials from .env
dotenv.config()

module.exports = {  
  // connect to db
  pool: new Pool({
   user: process.env.PGUSER,
   host: process.env.PGHOST,
   database: process.env.PGDATABASE,
   password: process.env.PGPASSWORD,
   port: process.env.PGPORT,
   idleTimeoutMillis: 10000,
   connectionTimeoutMillis: 10000,
   max: 50,
   ssl: {
     rejectUnauthorized: false
   },
 })
}