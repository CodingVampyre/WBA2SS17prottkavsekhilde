'use strict'

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'pug');
app.set("views", "html_template/");

app.use('/style',express.static('style'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", function(req, res){
  res.render("base.pug", {
      
  });
});

app.get("/impressum", function(req, res) {

  var impressum = fs.readFile('texts/impressum.txt', function(err, data) {

    if(err) { res.send("Error");}

    res.render("impressum.pug", {
      title: "Impressum",
      text: data.toString()
    });
  });

});

app.get("/cocktail/:cocktail", function(req, res) {

  res.render("cocktail.pug", {
    title: req.params.cocktail,
    cocktail: name,
    description: desq
  });
});

app.get("/new/cocktail", function (req, res) {
    res.render("cocktail_form.pug", {
      title: "New Cocktail"
    });
});

app.post("/createnewcocktail", function(req, res) {
  res.send(JSON.stringify(req.body));
});

app.get('*', function(req, res){
  res.render("404.pug", {

  })
});

app.listen(3000, function(){
  console.log("App is listening on Port 3000...");
});
