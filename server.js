var express = require('express');
var redis = require('redis');
var app = express();

app.get('/', function(req, res) {
  res.send("Welcome To Cocktailz backend. Please die!");
});

app.listen(3000, function() {
  console.log("App listening on port 3000");
})
