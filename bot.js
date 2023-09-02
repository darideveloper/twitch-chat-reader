const tmi = require('tmi.js')

// Get enviroment variables
require('dotenv').config()
const END_MINUTE = process.env.END_MINUTE

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Called every time a message comes in
async function onMessageHandler(target, context, comment, stream_id, pool, users_ids) {

  let query = ""
  const user_id = context["user-id"]
  const message_type = context["message-type"]

  // Get and validate message type
  if (!(message_type == "chat" || message_type == "whisper")) {

    // Save register of skipped message
    // console.log(`${target} - ${context.username}: (skipped: message type) ${comment}`)
    return null
  }

  try {

    // Get current date
    const now = new Date()
    const now_iso = now.toISOString()

    // Check if is not a streamer comment
    if (context.username == target.trim().replace('#', '')) {
      return null
    }

    // Check if user is exists in DB
    if (!users_ids.includes(parseInt(user_id))) {
      return null
    }

    // Clean comment
    comment = comment.replace("'", "").replace('"', '').replace(';', '').replace('`', '').replace('\\', '').replace('/', '').replace('%', '').replace('&', '').replace('<', '').replace('>', '').replace('=', '').replace('+', '').replace('-', '').replace('_', '').replace('*', '').replace('#', '').replace('@', '')

    // Save comment in DB
    query = `
    INSERT INTO app_comment(
      datetime, comment, stream_id, user_id, status_id)
      VALUES ('${now_iso}', '${comment}', ${stream_id}, ${user_id}, 1);
    `
    res = await pool.query(query)

    console.log(`${target} - ${context.username}: ${comment}`)

  } catch (error) {
    console.error(`${target} - ${context.username}: error saving comment: ${error} (${comment})`)
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(user_name, pool) {
  console.log(`* Connected with user ${user_name}`)
}

module.exports = {
  read_chat: async function (stream, pool) {

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

    // Get users ids from db
    query = `select id from app_user where is_active = true`
    users_ids = (await pool.query(query)).rows.map(user => user.id)

    // Register our event handlers (defined below)
    client.on('message', (target, context, msg) => onMessageHandler(target, context, msg, stream_id, pool, users_ids))
    client.on('connected', () => onConnectedHandler(user_name, pool))

    try {
      // Connect to Twitch:
      await client.connect()
    } catch (err) {

      // Show connection error
      console.error(`Error connecting with user ${user_name}: ${err}`)
      return "Error connecting with user"
    }

    // Calculate minutes to end time
    const now_date = new Date()
    // Change minuto of end_date to END_MINUTE
    const end_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours(), END_MINUTE, 0, 0)
    const minutes = parseInt((end_date - now_date) / 1000 / 60)

    // Get hours as HH:MM
    const now_time = `${now_date.getHours()}:${now_date.getMinutes()}`
    const end_time = `${end_date.getHours()}:${end_date.getMinutes()}`

    // Log times
    console.log(`* ${user_name} - starting: ${now_time} - ending: ${end_time} - minutes: ${minutes}`)

    // Close connection after wait time
    await sleep(minutes * 60 * 1000)
    client.disconnect()
    return "done"
  }
}