'use strict'
const PORT = process.argv[2];
const DIENSTNUTZERPORT = 1337;

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

  var getSpecificCocktail = {
    host: '127.0.0.1',
    path: '/cocktails/'+req.params.cocktail,
    port: DIENSTNUTZERPORT,
    method: 'GET'
  };

  var getSpecificCocktailIngredients = {
    host: '127.0.0.1',
    path: '/cocktails/'+req.params.cocktail+"/ingredients",
    port: DIENSTNUTZERPORT,
    method: 'GET'
  }

  http.get(getSpecificCocktail, (response) => {
    response.setEncoding('utf8');

    response.on("data", (data) => {
      data=JSON.parse(data);

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

  var mymessage = "Hey! There was a BRAND NEW cocktail on our site, my droogs: " + req.body.cocktail_name;

  mytwitter.post('statuses/update', {status: mymessage}, (err, data, response) => {
    res.send("/");
  });

  res.send(JSON.stringify(req.body));
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

app.get("/testtweet/:message", jsonparser, (req, res) => {
  mytwitter.post('statuses/update', { status: req.params.message }, function(err, data, response) {
    console.log(data);
    res.set({'Content-Type':'text/plain'});
    res.write("Tweet wurde gesendet <3");
    res.end();
  });
});

io.on('connection', (socket) => {
  console.log("Another day began, another user connected.");

  setInterval( () => {
    mytwitter.get("statuses/user_timeline", {name: "@CocktailsOrange", count: 1}, (err, data, response) =>{
      console.log(JSON.stringify(data[0].text));
      var statuses = data[0];
      socket.emit('fakenews', statuses.text);
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
