require('dotenv').config()
const express = require('express')
const bot = require('./bot.js')
const app = express()
const port = process.env.PORT || 5000

app.use(express.json())

app.get ('/', (req, res) => {
  res.send('app running')
})

app.post('/', (req, res) => {

  if (Object.keys(req.body).length == 0) {
    res.status(400).send("streams are required")
    return ""
  }

  // Get streams from json
  const streams = req.body.streams
  console.log (`streams: ${streams.map(stream => stream.user_name).join(",")}` )

  // Validate if there are streams
  if (streams.length == 0) {
    message = "no new streams"
    console.log(message)
    res.send(message)
    return ""
  }

  // Loop each stream
  for (const stream of streams) {
    bot.read_chat(stream).then((res) => {
      // Remove current stream from live streams
      console.log (`Stream ${stream.user_name} ended.`)
      return "Thread end"
    })
  }
  
  res.send('done')
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})