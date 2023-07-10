const { pool } = require('./db')

module.exports = {
  saveLog: function (details, isError = false) {

    // Log to console
    const logTypeText = isError ? "error" : "info"
    const logTypeNum = isError ? 2 : 1

    // Get current datetime
    const now = new Date()

    // Save log to db
    const query = `INSERT INTO public.app_log(
      origin_id, details, log_type_id, datetime)
      VALUES (2, '${details}', ${logTypeNum}, '${now.toISOString()}')
      `
    pool.query(query).then(res => {
      console.log(`${logTypeText}: ${details}`)
    }).catch(err => {
      console.log(`error saving log: ${err}`)
    })
  }
}