"use strict";

require('dotenv').config();

var express = require('express');

var bot = require('./bot.js');

var app = express();
var port = 3000; // List of streams online

var live_streams = [];
app.use(express.json());
app.post('/', function (req, res) {
  // Get streams from json
  var streams = req.body.streams; // Filter only new streams

  var new_streams = streams.filter(function (stream) {
    return !live_streams.includes(stream.stream_id);
  }); // Validate if there are streams

  if (new_streams.length == 0) {
    message = "no new streams";
    console.log(message);
    res.send(message);
    return "";
  } // Upate live streams


  new_streams.map(function (stream) {
    return live_streams.push(stream.stream_id);
  }); // Start reading chat and update live streams after

  bot.read_chat(new_streams, live_streams).then(function (updated_live_streams) {
    live_streams = updated_live_streams;
  });
  res.send('done');
});
app.listen(port, function () {
  console.log("Listening on port ".concat(port));
});