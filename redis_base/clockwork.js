var express = require ("express");
var client = require ("redis").createClient();
var bodyParser = require ("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/test",function(req, res){
  client.hgetall("user:admin", function(err, reply){
    res.send((reply));
});

app.get("/user/:username", function(req, res){
  client.hgetall("user:"+req.params.username, function(err, rep){
    console.log("PENISPENIS"+rep);
    res.send(JSON.stringify(rep));
  });
});

});
app.listen(3000, '0.0.0.0', function(){
  console.log("Zeit für ein Rein-Raus-Spiel auf Port 3000");
});


app.post("/new/cocktail", (req, res) => {
  console.log(req);
  res.send(JSON.stringify(req.body.cocktail_name));

});

app.get("/list", (req, res) => {
  client.lrange("test:first","0","-1", (error, reply) => {
    res.send(JSON.stringify(reply));

  });
});
