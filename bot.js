const tmi = require('tmi.js')

const DURATION = process.env.DURATION

module.exports = {

}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  read_chat: async function (streams) {
  
    // Connect to each stream
    for (const stream of streams) {
      const user_name = stream.user_name
      const access_token = stream.access_token
  
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
      client.on('message', onMessageHandler)
      client.on('connected', onConnectedHandler)
  
      // Connect to Twitch:
      client.connect()
  
      // Close connection after wait time
      await sleep(DURATION * 60 * 1000)
      client.disconnect()
  
    }
  }
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {

  // Get and validate message type
  if (context["message-type"] == "chat" || context["message-type"] == "whisper") {

    // Get user id
    user_id = context["user-id"]

    // TODO: send message to database

    // Debug
    console.log(`target: ${target} - user: ${user_id} - message: ${msg}`)
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port, username) {
  console.log(`* Connected to ${addr}:${port}`)
}
