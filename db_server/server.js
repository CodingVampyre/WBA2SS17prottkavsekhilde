'use strict'

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');
var app = express();

const PORT = process.argv[2];

app.set('view engine', 'pug');
app.set("views", "html_template/");

app.use('/style',express.static('style'));
//app.use(bodyParser.json());
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
  http.get({
    host: 'localhost',
    path: '/cocktails',
    port: '1337',
    method: 'GET'
  }, (response) => {
    response.setEncoding('utf8');
    response.on("data", (data) => {
      res.set({'Content-Type':'application/json'});
      res.write(JSON.stringify(data));
      res.end();
    });
  });
});

app.get('*', (req, res) => {
  res.render("404.pug", {

  })
});

app.listen(PORT, function(){
  console.log("App is listening on Port " + PORT + "...");
});
