'use strict'

var express = require('express');
var Twit = require('twit');
var bodyParser = require ('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

app.get('/', function(req, res){
  res.send("SUCCESS");
});

app.get("/twitter/:search", function(req, res){

  T.get('search/tweets', {q: req.params.search, count: 20}, function(err, data, response){
    if (err) console.log(err);

    var emp = "";
    var statuses = data.statuses;
    var test = statuses[1].text;
    console.log(test);

    for (var i=0; i<statuses.length; i++) {
      emp += "<p>" + statuses[i].text + "</p><br>";
    }

    console.log(emp);

    res.send(emp);
  });

});

app.listen(3000, function(){
  console.log("Server running on Port 3000...");
});
