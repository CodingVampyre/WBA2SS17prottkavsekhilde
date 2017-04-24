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
    if (result != null) {
      res.send(JSON.stringify(result));
    } else {
      res.send(JSON.stringify("Error 404, Cocktail not found! Blegh!"));
    }
  });
});

app.get('/ingredient/:ingredient', function(req, res){
  client.hgetall("ingredient:"+req.params.ingredient, function(err, result){
    res.send(JSON.stringify(result));
  });
});

// TODO find out, how the reqßobject works
app.put('/ingredient', function(req, res){
  console.log('There was a put on /ingredient: '+req.name);
  //client.hmset("ingredient:"+req.body.name, "name", req.name, "desc", req.desc);
  res.send(JSON.stringify(req.body.name));
});

app.listen(3000, function() {
  console.log("App listening on port 3000");
});
