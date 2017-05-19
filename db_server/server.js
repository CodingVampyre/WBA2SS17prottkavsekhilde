'use strict'

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var app = express();

app.set('view engine', 'pug');
app.set("views", "html_template/");

app.use('/style',express.static('style'));
app.use(express.bodyParser());

var testString = "Alex DeLarge";

app.get("/", function(req, res){
  res.render("base.pug", {
      title: "Cocktails Orange",
      message: testString
  });
});

app.get("/impressum", function(req, res) {

  var impressum = fs.readFile('texts/impressum.txt', function(err, data) {

    if(err) {
      res.send("Error");
    }

    res.render("impressum.pug", {
      title: "Impressum",
      text: data.toString()
    });
  });

});

app.get("/cocktail/:cocktail", function(req, res) {

  // PLACEHOLDER
  var desq = "Ein Cocktail, der es in sich hat. Lorde Lorde Lorde!"
  var name = "Gin Tonic"

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
  console.log("Epnis!");
  res.send("Result: " + req.params.cocktail_name);
});

app.listen(3000, function(){
  console.log("App is listening on Port 3000...");
});
