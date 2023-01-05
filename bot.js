const tmi = require('tmi.js')
const axios = require('axios')

// Get enviroment variables
const DURATION = process.env.DURATION
const DJANGO_API = process.env.DJANGO_API

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Called every time a message comes in
async function onMessageHandler(target, context, comment, stream_id) {

  // Get and validate message type
  if (context["message-type"] == "chat" || context["message-type"] == "whisper") {

    // Get user id
    const user_id = context["user-id"]

    // Send message to Django API
    req = await axios.post (DJANGO_API, {user_id, stream_id, comment})

    // Validate if message was sent
    if (req.status == 200) {
      console.log(`target: ${target} - user: ${user_id} - message: ${comment}`)
    } else {
      console.log("Error sending message to Django API")
    }
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port, username) {
  console.log(`* Connected to ${addr}:${port}`)
}

module.exports = {
  read_chat: async function (streams) {
  
    // Connect to each stream
    for (const stream of streams) {
      const user_name = stream.user_name
      const access_token = stream.access_token
      const stream_id = stream.stream_id
  
      // Define configuration options
      const opts = {
        identity: {
          username: user_name,
          password: `oauth:${access_token}`
        },
        channels: [
          user_name
        ]
      }
  
      console.log(`Current user: ${user_name}`)
  
      // Create a client with our options
      const client = new tmi.client(opts)
  
      // Register our event handlers (defined below)
      client.on('message', async (target, context, msg, self) => onMessageHandler(target, context, msg, stream_id))
      client.on('connected', onConnectedHandler)
  
      // Connect to Twitch:
      client.connect()
  
      // Close connection after wait time
      await sleep(DURATION * 60 * 1000)
      client.disconnect()
    }
  }
}