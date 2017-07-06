'use strict'

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

const PORT = process.argv[2];

var service_provider_cocktails = {
  host: '127.0.0.1',
  path: '/cocktails',
  port: '1337',
  method: 'GET'
}

var mytwitter;

var jsonparser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  res.render("base.pug", {

  });
});

app.get("/impressum", (req, res) => {

  var impressum = fs.readFile('texts/impressum.txt', (err, data) => {

    if(err) { res.send("Error");}

    res.render("impressum.pug", {
      title: "Impressum",
      text: data.toString()
    });
  });

});

app.get("/cocktail/:cocktail", (req, res) => {

  res.render("cocktail.pug", {
    title: req.params.cocktail,
    cocktail: name,
    description: desq
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

app.get("/twitter_test", jsonparser, (req, res) => {
  mytwitter.get("search/tweets", {q: req.params.search, count: 10}, (err, data, response) => {
    if (err) console.log(err);

    res.set({'Content-Type':'text/json'});
    res.write(JSON.stringify(data.statuses));
    res.end();
  });
});

app.get('*', (req, res) => {
  res.render("404.pug", {

  })
});

app.listen(PORT, function(){

  if (PORT == undefined) {
    console.log("Please provide a port number as command parameter");
    process.exit(-1);
  }

  fs.readFile("misc/twitter_credentials.json", jsonparser, (err, rep) => {
    mytwitter = new twit(JSON.parse(rep));
  });

  console.log("App is listening on Port " + PORT + "...");
});
