"use strict";

require('dotenv').config();

var express = require('express');

var bot = require('./bot.js');

var app = express();
var port = 3000;
app.use(express.json());
app.post('/', function (req, res) {
  // Get streams from json
  var streams = req.body.streams; // Validate if there are streams

  if (streams.length == 0) {
    message = "no streams";
    console.log(message);
    res.send(message);
    return "";
  } // Start reading chat


  bot.read_chat(streams);
  res.send('done');
});
app.listen(port, function () {
  console.log("Listening on port ".concat(port));
});