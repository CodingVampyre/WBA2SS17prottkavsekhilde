var express = require('express');
var app = express();
var client = require('redis').createClient();

client.on('error', function(err){
  console.log('Err: '+ err);
});

app.get('/', function(req, res) {
  res.send("Welcome To Cocktailz backend. Please die!");
});

app.get('/cocktail/:cocktail', function(req, res){
  client.hgetall("cocktail:"+req.params.cocktail, function(err, result){
    res.send(JSON.stringify(result));
  });
});

app.get('/ingredient/:ingredient', function(req, res){
  client.hgetall("ingredient:"+req.params.ingredient, function(err, result){
    res.send(JSON.stringify(result));
  });
});

app.listen(3000, function() {
  console.log("App listening on port 3000");
});
