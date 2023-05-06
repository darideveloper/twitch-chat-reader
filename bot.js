const tmi = require('tmi.js')
const dotenv = require("dotenv")
const { Pool } = require('pg')

// Load crdentials from .env
dotenv.config()

// Database options
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
  max: 50,
  ssl: {
    rejectUnauthorized: false
  },
})

// Connect to DB
const connectDb = async () => {
  
}

connectDb ()

// Get enviroment variables
const END_MINUTE = process.env.END_MINUTE

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Called every time a message comes in
async function onMessageHandler(target, context, comment, stream_id) {

  // Get and validate message type
  if (! (context["message-type"] == "chat" || context["message-type"] == "whisper")) {
    return null
  }

  // Get user id
  const user_id = context["user-id"]

  try {

    // Validate connection
    let res = await pool.query('select count (id) from app_comment')
    
    // Save comment in DB
    const now = new Date()
    const now_iso = now.toISOString()
    
    query = `
    INSERT INTO app_comment(
      datetime, comment, stream_id, user_id, status_id)
      VALUES ('${now_iso}', '${comment}', ${stream_id}, ${user_id}, 1);
    `
    res = await pool.query(query)

    // Show details
    console.log(`[${now_iso}] ${target} - ${context.username}: ${comment}`)

  } catch (error) {
    // Show error
    console.log ("ERROR CONNECTING TO DB")
    console.log(error)
  }  
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(user_name) {
  console.log(`* Connected with user ${user_name}`)
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
      console.log(`* Error connecting with user ${user_name}. Error: ${err}`)
      return "Error connecting with user"
    }

    // Calculate minutes to end time
    const now_date = new Date()
    // const end_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours() + 1, END_MINUTE, 0, 0)
    const end_date = new Date(now_date.getFullYear(), now_date.getMonth(), now_date.getDate(), now_date.getHours(), END_MINUTE, 0, 0)
    minutes = (end_date - now_date) / 1000 / 60
    console.log(`Thread will end in ${parseInt(minutes)} minutes.`)

    // Close connection after wait time
    await sleep(minutes * 60 * 1000)
    client.disconnect()
    return "done"
  }
}