"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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


function onConnectedHandler(user_name) {
  console.log("* Connected with user ".concat(user_name));
}

module.exports = {
  read_chat: function read_chat(streams, live_streams) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step, _ret;

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
                      }; // Create a client with our options

                      client = new tmi.client(opts); // Register our event handlers (defined below)

                      client.on('message', function _callee() {
                        var _len,
                            _ref,
                            _key,
                            target,
                            context,
                            msg,
                            _args2 = arguments;

                        return regeneratorRuntime.async(function _callee$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                for (_len = _args2.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
                                  _ref[_key] = _args2[_key];
                                }

                                target = _ref.target, context = _ref.context, msg = _ref.msg;
                                return _context2.abrupt("return", onMessageHandler(target, context, msg, stream_id));

                              case 3:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        });
                      });
                      client.on('connected', function () {
                        return onConnectedHandler(user_name);
                      }); // Connect to Twitch:

                      client.connect(); // Close connection after wait time

                      _context3.next = 11;
                      return regeneratorRuntime.awrap(sleep(DURATION * 60 * 1000));

                    case 11:
                      client.disconnect();
                      console.log("* Disonnected with user ".concat(user_name));
                      return _context3.abrupt("return", {
                        v: live_streams.filter(function (stream) {
                          return stream != stream_id;
                        })
                      });

                    case 14:
                    case "end":
                      return _context3.stop();
                  }
                }
              });
            };

            _iterator = streams[Symbol.iterator]();

          case 6:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 15;
              break;
            }

            _context4.next = 9;
            return regeneratorRuntime.awrap(_loop());

          case 9:
            _ret = _context4.sent;

            if (!(_typeof(_ret) === "object")) {
              _context4.next = 12;
              break;
            }

            return _context4.abrupt("return", _ret.v);

          case 12:
            _iteratorNormalCompletion = true;
            _context4.next = 6;
            break;

          case 15:
            _context4.next = 21;
            break;

          case 17:
            _context4.prev = 17;
            _context4.t0 = _context4["catch"](3);
            _didIteratorError = true;
            _iteratorError = _context4.t0;

          case 21:
            _context4.prev = 21;
            _context4.prev = 22;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 24:
            _context4.prev = 24;

            if (!_didIteratorError) {
              _context4.next = 27;
              break;
            }

            throw _iteratorError;

          case 27:
            return _context4.finish(24);

          case 28:
            return _context4.finish(21);

          case 29:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
  }
};