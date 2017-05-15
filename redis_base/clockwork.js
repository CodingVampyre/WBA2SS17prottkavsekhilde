var express = require ("express");
var client = require ("redis").createClient();

var app = express();

app.get("/test",function(req, res){
  client.hgetall("user:admin", function(err, reply){
    res.send((reply));
  });

app.get("/cocktail)"

});
app.listen(3000,function(){
  console.log("läuft bei dir");
});
