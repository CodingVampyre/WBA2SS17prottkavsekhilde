var express = require ("express");
var client = require ("redis").createClient();

var app = express();

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
app.listen(3000,function(){
  console.log("Zeit für ein Rein-Raus-Spiel auf Port 3000");
});
