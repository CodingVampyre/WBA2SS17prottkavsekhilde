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

// TODO test_required
app.post("/createnewcocktail", jsonparser, (req, res) => {

  var getSpecificCocktail = {
    host: '127.0.0.1',
    path: '/cocktails/'+req.body.cocktail_name,
    port: DIENSTNUTZERPORT,
    method: 'GET'
  };

  var mymessage = "Hey droogs! There was a BRAND NEW cocktail on our site: http://127.0.0.1/cocktail/" + req.body.cocktail_name;

  mytwitter.post('statuses/update', {status: mymessage}, (err, data, response) => {
    http.get(getSpecificCocktail, (response) => {
      response.setEncoding('utf8');
      response.on("data", (data) => {
        data = JSON.parse(data);

        res.render("cocktail.pug", {
          cocktail: data.name,
          description: data.desc
        });
      });
    });
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
