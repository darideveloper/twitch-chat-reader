"use strict";

require('dotenv').config();

var express = require('express');

var bot = require('./bot.js');

var app = express();
var port = 3000; // List of streams online

var live_streams = [];
app.use(express.json());
app.post('/', function (req, res) {
  if (Object.keys(req.body).length == 0) {
    res.status(400).send("streams are required");
    return "";
  } // Get streams from json


  var streams = req.body.streams; // Filter only new streams

  var new_streams = streams.filter(function (stream) {
    return !live_streams.includes(stream.access_token);
  }); // Validate if there are streams

  if (new_streams.length == 0) {
    message = "no new streams";
    console.log(message);
    res.send(message);
    return "";
  } // Upate live streams


  new_streams.map(function (stream) {
    return live_streams.push(stream.access_token);
  }); // Start reading chat and update live streams after

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = new_streams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var stream = _step.value;
      bot.read_chat(stream).then(function (res) {
        // Remove current stream from live streams
        live_streams = live_streams.filter(function (stream) {
          return stream != stream.access_token;
        });
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  res.send('done');
});
app.listen(port, function () {
  console.log("Listening on port ".concat(port));
});