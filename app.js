const express = require('express')
const bot = require('./bot.js')
const app = express()
const port = 3000

app.use(express.json());

app.post ('/', (req, res) => {
  
  // Get streams from json
  const streams = req.body.streams

  // Validate if there are streams
  if (streams.length == 0) {
    message = "no streams"
    console.log (message)
    res.send(message)
    return ""
  }

  // Start reading chat
  bot.read_chat(streams)
  res.send('done')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})