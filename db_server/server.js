'use strict'
const PORT = process.argv[2];
const DIENSTNUTZERPORT = 1337;

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');
var request = require('request');
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

app.get("/cocktails", jsonparser, (req, res) => {

  var myurl = 'http://127.0.0.1:'+DIENSTNUTZERPORT+"/cocktails";

  request.get(myurl, (error, response, body) => {
    //console.log("Error: "+ error);
    //console.log("Response: " + response);
    //console.log("Body: " + body);

    if (!error) {
      body = JSON.parse(body);
      body.forEach((element) => {
        console.log(element);
      });
      res.render("cocktaillist.pug", {
        listi: body
      });
    } else {
      res.render("cocktaillist.pug", {
        listi: null
      });
    }

  });

});

// TODO TEST;
app.get("/cocktails/:cocktail", jsonparser, (req, res) => {
  var mycocktail = "http://127.0.0.1:"+ DIENSTNUTZERPORT + "/cocktails/"+req.params.cocktail;

  request.get(mycocktail, (error, response, body) => {

    //console.log("Request: "+mycocktail);
    //console.log("error: "+error);
    //console.log("response: "+response);
    //console.log("body: "+body);

    if(!error) {
      body = JSON.parse(body);

      var myingredients = "http://127.0.0.1:"+DIENSTNUTZERPORT+"/cocktails/"+req.params.cocktail+"/ingredients";

      request.get(myingredients, (error2, response2, body2) => {

        console.log("myingredients: " + body2);

        body2 = JSON.parse(body2);

        console.log("myingredients(STRINGIFIED: " + body2);

        if (!error2) {
          res.render("cocktail.pug", {
            cocktail: body.name,
            description: body.desc,
            ingredients: body2
          });
        } else {
          res.render("cocktail.pug", {
            cocktail: body.name,
            description: body.desc,
            ingredients: null
          });
        }
      });
    } else {
      res.render("cocktail.pug", {
        cocktail: "Fehler",
        description: "leider Konnten wir ihren Cock...Tail nicht finden."
      });
    }
  })
});

// FINISHED
app.get("/new/cocktail", (req, res) => {
    res.render("cocktail_form.pug", {
      title: "New Cocktail"
    });
});

// TODO test_required
app.post("/createnewcocktail", jsonparser, (req, res) => {

  var getSpecificCocktail = {
    host: '127.0.0.1',
    path: '/cocktail/'+req.body.cocktail_name,
    port: DIENSTNUTZERPORT,
    method: 'GET'
  };

  var postSpecificCocktail = {
    host: '127.0.0.1',
    path: '/cocktails',
    port: DIENSTNUTZERPORT,
    method: 'POST'
  };

  var getSpecificCocktail = "127.0.0.1:"+DIENSTNUTZERPORT+"/cocktail/"+req.body.cocktail_name;
  var postSpecificCocktail = "127.0.0.1:"+DIENSTNUTZERPORT+"/cocktails";
  var mymessage = "Hey droogs! There was a BRAND NEW cocktail on our site: /cocktail/" + req.body.cocktail_name;

  mytwitter.post('statuses/update', {status: mymessage}, (err, data, response) => {

    http.post(postSpecificCocktail, (response) => {

    });

    http.get(getSpecificCocktail, (response) => {
      response.setEncoding('utf8');
      response.on("data", (data) => {
        
        console.log(data);
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
  var users = "http://127.0.0.1:"+DIENSTNUTZERPORT+"/users"

  // Real Time Updates Of Tweets by our account
  setInterval( () => {
    mytwitter.get("statuses/user_timeline", {name: "@CocktailsOrange", count: 1}, (err, data, response) =>{
      var statuses = data[0];
      socket.emit('fakenews', statuses.text);
    });
  }, 5000);

  // Real Time Update of all existing Users, TODO Test
  setInterval( () => {
    request.get(users, (error, response, body) => {
      if (!error) {
        socket.emit('userlist', body);
      } else {
        socket.emit('userlist', null);
      }
    })
  }, 2000);

  io.on('disconnect', () => {
    console.log("Bye Bye, droog!");
  });

});

app.get('*', (req, res) => {
  res.render("404.pug", {

  })
});
