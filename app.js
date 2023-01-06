require('dotenv').config()
const express = require('express')
const bot = require('./bot.js')
const app = express()
const port = 3000

// List of streams online
let live_streams = []

app.use(express.json())

app.post('/', (req, res) => {

  // Get streams from json
  const streams = req.body.streams

  // Filter only new streams
  const new_streams = streams.filter(stream => !live_streams.includes(stream.stream_id))

  // Validate if there are streams
  if (new_streams.length == 0) {
    message = "no new streams"
    console.log(message)
    res.send(message)
    return ""
  }

  // Upate live streams
  new_streams.map(stream => live_streams.push(stream.stream_id))

  // Start reading chat and update live streams after
  for (const stream of new_streams) {
    bot.read_chat(stream).then((res) => {
      // Remove current stream from live streams
      live_streams = live_streams.filter(stream => stream != stream.stream_id)
    })
  }

  res.send('done')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})