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


app.post("/user", (req, res) => {
  client.hgetall("user:"+req.body.name, (error, reply) => {
    res.send(JSON.stringify(reply));
  });
});

app.put("/user", (req, res) => {

  var canset = true;

  client.lrange("list:users", "0", "-1", (error, reply) => {

    for (var i=0; i<reply.length; i++) {
      if (reply[i] == req.body.name) {
        canset = false;
      }
    }

    if (canset) {
      client.hmset("user:"+req.body.name, "name", req.body.name, "email", req.body.email, "pass", req.body.pass, (error, reply) => {
        client.rpush("list:users", req.body.name, (error, reply) => {
          res.send("Saved into liste!");
        });
      });
    } else {
      res.send("Already exists");
    }
  });
});
