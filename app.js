const express = require('express')
const bot = require('./bot.js')
const { saveLog } = require('./logs')
const app = express()
const { getPool } = require('./db')

require('dotenv').config()
const port = process.env.PORT || 5000

let current_streams = []

app.use(express.json())

app.get ('/', (req, res) => {
  res.send('app running')
})

app.get ('/streams/', (req, res) => {
  res.send({streams: current_streams})
})

app.post('/', (req, res) => {

  if (Object.keys(req.body).length == 0) {
    res.status(400).send("streams are required")
    return ""
  }

  // Connedct to db
  const pool = getPool()

  // Get streams from json
  const streams = req.body.streams
  saveLog (`streams: ${streams.map(stream => stream.user_name).join(",")}`, pool)

  // Validate if there are streams
  if (streams.length == 0) {
    message = "no new streams"
    saveLog(message, pool)
    res.send(message)
    return ""
  }

  // Loop each stream
  for (const stream of streams) {

    // Ignore current streams
    if (current_streams.includes(stream.user_name)) {
      continue
    }

    // Save current stream
    current_streams.push(stream.user_name)

    // Start chat reader
    bot.read_chat(stream, pool).then((res) => {

      // Remove current stream from live streams
      saveLog (`Stream ${stream.user_name} ended.`, pool)

      // Remove current stream from live streams
      current_streams = current_streams.filter(item => item !== stream.user_name)

      return "Thread end"
    })
  }
  
  res.send('done')
})

app.listen(port, () => {
  const pool = getPool()
  saveLog(`Listening on port ${port}`, pool)
})