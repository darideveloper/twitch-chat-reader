const tmi = require('tmi.js')
const { saveLog } = require('./logs')
const { pool } = require('./db')

// Get enviroment variables
const END_MINUTE = process.env.END_MINUTE

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Called every time a message comes in
async function onMessageHandler(target, context, comment, stream_id) {

  let query = ""
  const user_id = context["user-id"]
  const message_type = context["message-type"]

  // Get and validate message type
  if (! (message_type == "chat" || message_type == "whisper")) {

    // Save register of skipped message
    saveLog (`${target} - ${context.username}: (skipped: message type) ${comment}`)
    return null
  }

  try {

    // Get current date
    const now = new Date()
    const now_iso = now.toISOString()

    // Check if is not a streamer comment
    if (context.username == target.trim().replace('#', '')) {
      saveLog (`${target} - ${context.username}: (skipped: streamer comment) ${comment}`)
      return null
    }

    // Check if user is exists in DB
    let res = await pool.query(`SELECT id FROM app_user WHERE id = ${user_id}`)
    if (res.rows.length == 0) {
      saveLog (`${target} - ${context.username}: (skipped: user not registered) ${comment}`)
      return null
    }
    
    // Clean comment
    comment = comment.replace("'", "").replace('"', '').replace(';', '').replace ('`', '').replace ('\\', '').replace ('/', '').replace ('%', '').replace ('&', '').replace ('<', '').replace ('>', '').replace ('=', '').replace ('+', '').replace ('-', '').replace ('_', '').replace ('*', '').replace ('#', '').replace ('@', '') 
    
    // Save comment in DB
    query = `
    INSERT INTO app_comment(
      datetime, comment, stream_id, user_id, status_id)
      VALUES ('${now_iso}', '${comment}', ${stream_id}, ${user_id}, 1);
    `
    res = await pool.query(query)

    saveLog (`${target} - ${context.username}: ${comment}`)

  } catch (error) {
    // Save error
    saveLog (`${target} - ${context.username}: error saving comment: ${error} ${comment}`, true)
    pool.query(query)
  }  
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(user_name) {
  saveLog (`* Connected with user ${user_name}`)
}

module.exports = {
  read_chat: async function (stream) {

    // Connect to the stream
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

    // Create a client with our options
    const client = new tmi.client(opts)

    // Register our event handlers (defined below)
    client.on('message', (target, context, msg) => onMessageHandler(target, context, msg, stream_id))
    client.on('connected', () => onConnectedHandler(user_name))

    try {
      // Connect to Twitch:
      await client.connect()
    } catch (err) {

      // Show connection error
      saveLog (`Error connecting with user ${user_name}: ${err}`, true)
      return "Error connecting with user"
    }

    // Calculate minutes to end time
    const now_date = new Date()
    // const end_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours() + 1, END_MINUTE, 0, 0)
    const end_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours(), END_MINUTE, 0, 0)
    minutes = (end_date - now_date) / 1000 / 60

    // Close connection after wait time
    await sleep(minutes * 60 * 1000)
    client.disconnect()
    return "done"
  }
}