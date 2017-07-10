'use strict'
const PORT = process.argv[2];

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();
var twit = require('twit'); // USE external API of twitter

app.set('view engine', 'pug');
app.set("views", "html_template/");
app.use('/style',express.static('style'));
app.use('/misc', express.static('misc'));

var service_provider_cocktails = {
  host: '127.0.0.1',
  path: '/cocktails',
  port: '1337',
  method: 'GET'
}

var mytwitter;
var jsonparser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }))

const server = app.listen(PORT, function(){

  if (PORT == undefined) {
    console.log("Please provide a port number as command parameter");
    process.exit(-1);
  }

  fs.readFile("misc/twitter_credentials.json", jsonparser, (err, rep) => {
    mytwitter = new twit(JSON.parse(rep));
  });

  console.log("App is listening on Port " + PORT + "...");
});

var io = require('socket.io')(server);

app.get("/", (req, res) => {
  res.render("base.pug", {

  });
});

app.get("/cocktail/:cocktail", jsonparser, (req, res) => {

  var provider = {
    host: '127.0.0.1',
    path: '/cocktails/:name',
    port: '1337',
    method: 'GET'
  };

  http.get(provider, (response) => {
    console.log("Response: " + response.toString());
    response.setEncoding('utf8');
    response.on("data", (data)=>{
      console.log("Data from Dienstgeber: "+data);
      res.render("cocktail.pug", {
        cocktail: data.name,
        description: data.desc
      });
    });
  });
});

app.get("/new/cocktail", (req, res) => {
    res.render("cocktail_form.pug", {
      title: "New Cocktail"
    });
});

app.post("/createnewcocktail", jsonparser, (req, res) => {
  res.send(JSON.stringify(req.body));
});

app.get("/testrequest", jsonparser, (req, res) => {
  http.get(service_provider_cocktails, (response) => {
    response.setEncoding('utf8');
    response.on("data", (data) => {
      res.set({'Content-Type':'application/json'});
      res.write(data);
      res.end();
    });
  });
});

app.get("/twitter_test/:search", jsonparser, (req, res) => {
  mytwitter.get("search/tweets", {q: req.params.search, count: 10}, (err, data, response) => {
    if (err) console.log(err);

    var puttt = "";
    var statuses = data.statuses;

    for (var bla = 0; bla<statuses.length; ++bla) {
      puttt += "<h1>" + statuses[bla].user.name +"</h1><p>: " + statuses[bla].text + "</p>";
    }

    res.set({'Content-Type':'text/html'});
    res.write(JSON.stringify(puttt));
    res.end();
  });
});

app.get("/testtweet", jsonparser, (req, res) => {
  mytwitter.post('statuses/update', { status: 'Welcome to the Real World!' }, function(err, data, response) {
    console.log(data);
  });
});

io.on('connection', (socket) => {
  console.log("Another day began, another user connected.");

  setInterval(()=>{
    mytwitter.get("search/tweets", {q: "Milch", count: 1}, (err, data, response) =>{
      socket.emit('fakenews', data.statuses[0].user.name);
    });
  }, 5000);

  io.on('disconnect', () => {
    console.log("Bye Bye, droog!");
  });

});

app.get('*', (req, res) => {
  res.render("404.pug", {

  })
});
