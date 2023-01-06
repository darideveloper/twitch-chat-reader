"use strict";

var tmi = require('tmi.js');

var axios = require('axios'); // Get enviroment variables


var DURATION = process.env.DURATION;
var DJANGO_ADD_COMMENT = process.env.DJANGO_ADD_COMMENT;
var DJANGO_REFRESH_TOKEN = process.env.DJANGO_REFRESH_TOKEN;

function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
} // Called every time a message comes in


function onMessageHandler(target, context, comment, stream_id) {
  var user_id;
  return regeneratorRuntime.async(function onMessageHandler$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (!(context["message-type"] == "chat" || context["message-type"] == "whisper")) {
            _context.next = 13;
            break;
          }

          // Get user id
          user_id = context["user-id"]; // Send message to Django API

          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(axios.post(DJANGO_ADD_COMMENT, {
            user_id: user_id,
            stream_id: stream_id,
            comment: comment
          }));

        case 5:
          req = _context.sent;
          _context.next = 12;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](2);
          console.log("target: ".concat(target, " - user: ").concat(user_id, " - message: ").concat(comment, " (received but no saved)"));
          return _context.abrupt("return", "");

        case 12:
          console.log("target: ".concat(target, " - user: ").concat(user_id, " - message: ").concat(comment));

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 8]]);
} // Called every time the bot connects to Twitch chat


function onConnectedHandler(user_name) {
  console.log("* Connected with user ".concat(user_name));
}

module.exports = {
  read_chat: function read_chat(stream) {
    var user_name, access_token, stream_id, opts, client;
    return regeneratorRuntime.async(function read_chat$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            // Connect to the stream
            user_name = stream.user_name;
            access_token = stream.access_token;
            stream_id = stream.stream_id; // Define configuration options

            opts = {
              identity: {
                username: user_name,
                password: "oauth:".concat(access_token)
              },
              channels: [user_name]
            }; // Create a client with our options

            client = new tmi.client(opts); // Register our event handlers (defined below)

            client.on('message', function _callee(target, context, msg) {
              return regeneratorRuntime.async(function _callee$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      return _context2.abrupt("return", onMessageHandler(target, context, msg, stream_id));

                    case 1:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            });
            client.on('connected', function () {
              return onConnectedHandler(user_name);
            });
            _context3.prev = 7;
            _context3.next = 10;
            return regeneratorRuntime.awrap(client.connect());

          case 10:
            _context3.next = 25;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](7);
            // Show connection error
            console.log("* Error connecting with user ".concat(user_name, ". Error: ").concat(_context3.t0)); // Catch refresh token error

            if (!(_context3.t0 == "Login authentication failed")) {
              _context3.next = 24;
              break;
            }

            // Send flag to django for refresh token
            console.log("* Requesting refresh token for user ".concat(user_name, "..."));
            _context3.next = 19;
            return regeneratorRuntime.awrap(axios.post(DJANGO_REFRESH_TOKEN, {
              "expired_token": access_token
            }));

          case 19:
            req = _context3.sent;
            _context3.next = 22;
            return regeneratorRuntime.awrap(sleep(3000));

          case 22:
            // Catch error from django refresh token
            if (req.status != 200) {
              console.log("* Error requesting refresh token for user ".concat(user_name, ". Error: ").concat(req.body));
            }

            return _context3.abrupt("return", "refresh token error");

          case 24:
            return _context3.abrupt("return", "unknown error");

          case 25:
            // Close connection after wait time
            console.log("* Connected with user ".concat(user_name));
            _context3.next = 28;
            return regeneratorRuntime.awrap(sleep(DURATION * 60 * 1000));

          case 28:
            client.disconnect();
            return _context3.abrupt("return", "done");

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[7, 12]]);
  }
};