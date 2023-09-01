const dotenv = require("dotenv")
const { Pool } = require('pg')

// Load crdentials from .env
dotenv.config()

module.exports = {  
  // connect to db
  getPool: () => {
    return new Pool({
     user: process.env.PGUSER,
     host: process.env.PGHOST,
     database: process.env.PGDATABASE,
     password: process.env.PGPASSWORD,
     port: process.env.PGPORT,
     idleTimeoutMillis: 2000,
     connectionTimeoutMillis: 2000,
     max: 50,
     ssl: {
       rejectUnauthorized: false
     },
   })
  } 
}