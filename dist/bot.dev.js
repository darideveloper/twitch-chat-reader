"use strict";

var tmi = require('tmi.js');

var axios = require('axios'); // Get enviroment variables


var DURATION = process.env.DURATION;
var DJANGO_API = process.env.DJANGO_API;

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
            _context.next = 6;
            break;
          }

          // Get user id
          user_id = context["user-id"]; // Send message to Django API

          _context.next = 4;
          return regeneratorRuntime.awrap(axios.post(DJANGO_API, {
            user_id: user_id,
            stream_id: stream_id,
            comment: comment
          }));

        case 4:
          req = _context.sent;

          // Validate if message was sent
          if (req.status == 200) {
            console.log("target: ".concat(target, " - user: ").concat(user_id, " - message: ").concat(comment));
          } else {
            console.log("Error sending message to Django API");
          }

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
} // Called every time the bot connects to Twitch chat


function onConnectedHandler(addr, port, username) {
  console.log("* Connected to ".concat(addr, ":").concat(port));
}

module.exports = {
  read_chat: function read_chat(streams) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

    return regeneratorRuntime.async(function read_chat$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            // Connect to each stream
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 3;

            _loop = function _loop() {
              var stream, user_name, access_token, stream_id, opts, client;
              return regeneratorRuntime.async(function _loop$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      stream = _step.value;
                      user_name = stream.user_name;
                      access_token = stream.access_token;
                      stream_id = stream.stream_id; // Define configuration options

                      opts = {
                        identity: {
                          username: user_name,
                          password: "oauth:".concat(access_token)
                        },
                        channels: [user_name]
                      };
                      console.log("Current user: ".concat(user_name)); // Create a client with our options

                      client = new tmi.client(opts); // Register our event handlers (defined below)

                      client.on('message', function _callee(target, context, msg, self) {
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
                      client.on('connected', onConnectedHandler); // Connect to Twitch:

                      client.connect(); // Close connection after wait time

                      _context3.next = 12;
                      return regeneratorRuntime.awrap(sleep(DURATION * 60 * 1000));

                    case 12:
                      client.disconnect();

                    case 13:
                    case "end":
                      return _context3.stop();
                  }
                }
              });
            };

            _iterator = streams[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 12;
              break;
            }

            _context4.next = 9;
            return regeneratorRuntime.awrap(_loop());

          case 9:
            _iteratorNormalCompletion = true;
            _context4.next = 6;
            break;

          case 12:
            _context4.next = 18;
            break;

          case 14:
            _context4.prev = 14;
            _context4.t0 = _context4["catch"](3);
            _didIteratorError = true;
            _iteratorError = _context4.t0;

          case 18:
            _context4.prev = 18;
            _context4.prev = 19;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 21:
            _context4.prev = 21;

            if (!_didIteratorError) {
              _context4.next = 24;
              break;
            }

            throw _iteratorError;

          case 24:
            return _context4.finish(21);

          case 25:
            return _context4.finish(18);

          case 26:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[3, 14, 18, 26], [19,, 21, 25]]);
  }
};