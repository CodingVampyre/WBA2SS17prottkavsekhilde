var express = require ("express");
var client = require ("redis").createClient();
var bodyParser = require ("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/user", (req, res) => {
  client.lrange("list:users", "0", "-1", (error, reply) => {
    res.send(JSON.stringify(reply));
  });
});

app.get("/user/:id", (req, res) => {
  
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

app.post("/user", (req, res) => {

});

app.delete("/user/:id", (req, res) => {

});

app.get("/cocktails", (req, res) => {

});

app.get("/cocktails/:name", (req, res) => {

});

app.put("/cocktails", (req, res) => {

});

app.post("/cocktails", (req, res) => {

});

app.delete("/cocktails/:name", (req, res) => {

});

app.get("/ingredients", (req, res) => {

});

app.get("/ingredients/:ingredient", (req, res) => {

});

app.put("/ingredients", (req, res) => {

});

app.post("/ingredients", (req, res) => {

});

app.delete("/ingredients/:ingredient", (req, res) => {

});

app.get("/cocktails/:name/ingredients", (req, res) => {

});

app.post("/cocktails/:name/ingredients", (req, res) => {

});

app.listen(3000, '0.0.0.0', function(){
  console.log("Zeit für ein Rein-Raus-Spiel auf Port 3000");
});
