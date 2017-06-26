var express = require ("express");
var client = require ("redis").createClient();
var bodyParser = require ("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// KAVSEK
app.get("/user", (req, res) => {
  client.lrange("list:users", "0", "-1", (error, reply) => {
    res.send(JSON.stringify(reply));
  });
});

app.get("/user/:id", (req, res) => {
  client.hgetall("user:"+req.params.id, (error, reply) => {
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

app.post("/user", (req, res) => {
  var canupdate = false;

  client.lrange("list:users", "0", "-1", (error, reply) => {
    for (var j = 0; j<reply.length; j++) {
      if (reply[i] == req.body.name) {
        canset = true;
        break;
      }
    }

    // TODO let only update was was provided
    if (canset) {
      client.hmset("user":+req.body.name, "name", req.body.name, "email", req.body.email, "pass", req.body.pass, (error, reply) => {
        client.rpush("list:users", req.body.name, (error, reply) => {
          res.send("Updated into list");
        });
      });
    } else {
      res.send("Entry did not exist");
    }
  });
});

app.delete("/user/:id", (req, res) => {
  var candelete = false;
  client.lrange("list:users", "0", "-1", (error, reply) => {
    for (var j = 0; j<reply.length; j++) {
      if(reply[i] == req.body.name) {
        candelete = true;
        break;
      }
    }

    if (candelete) {
      client.del("user:"+req.body.name, (error, reply) => {
        client.lrem("list:users", req.body.name, (error, reply) => {
          res.send("DELETION SUCCESSFUL");
        });
      });
    } else {
      res.send("NON EXISTENT ENTRY COULD NOT BE DELETED");
    }
  });
});

// HILDEBRANDT
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

// PROTT
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

// KAVSEK, HILDEBRAND & PROTT
app.get("/cocktails/:name/ingredients", (req, res) => {

});

app.post("/cocktails/:name/ingredients", (req, res) => {

});

app.listen(3000, '0.0.0.0', function(){
  console.log("Zeit für ein Rein-Raus-Spiel auf Port 3000");
});
