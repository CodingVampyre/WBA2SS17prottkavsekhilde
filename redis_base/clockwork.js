var express = require ("express");
var client = require ("redis").createClient();
var bodyParser = require ("body-parser");
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
var jsonparser = bodyParser.json();

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

app.put("/user", jsonparser, (req, res) => {

  var canset = true;

  client.lrange("list:users", "0", "-1", (error, reply) => {

    console.log(req.body.name);

    for (var i=0; i<reply.length; i++) {
      if (reply[i] == req.body.name) {
        canset = false;
      }
    }

    if (canset) {
      client.hmset("user:"+req.body.name, "name", req.body.name, "mail", req.body.email, "pass", req.body.pass, (error, reply) => {
        client.rpush("list:users", req.body.name, (error, reply) => {
          res.send("Saved into liste!");
        });
      });
    } else {
      res.send("Already exists");
    }
  });
});

app.post("/user", jsonparser, (req, res) => {
  var canupdate = false;

  client.lrange("list:users", "0", "-1", (error, reply) => {
    for (var j = 0; j<reply.length; j++) {
      if (reply[j] == req.body.name) {
        canset = true;
        break;
      }
    }

    // TODO let only update was was provided
    if (canset) {
      client.hmset("user:" + req.body.name, "name", req.body.name, "email", req.body.email, "pass", req.body.pass, (error, reply) => {
        client.rpush("list:users", req.body.name, (error, reply) => {
          res.send("Updated into list");
        });
      });
    } else {
      res.send("Entry did not exist");
    }
  });
});

app.delete("/user/:id", jsonparser, (req, res) => {
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
        client.lrem("list:users", "0", req.body.name, (error, reply) => {
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
  client.lrange("list:ingredients", "0", "-1", (error, reply) => {
    res.send(JSON.stringify(reply));
  });
});

app.get("/ingredients/:ingredient", (req, res) => {
  client.hgetall("ingredients:"+req.params.ingredient, (error, reply) => {
    res.send(JSON.stringify(reply));
  });
});

app.put("/ingredients", (req, res) => {

    var canset = true;

    client.lrange("list:ingredients", "0", "-1", (error, reply) => {

      for (var i=0; i<reply.length; i++) {
        if (reply[i] == req.body.name) {
          canset = false;
        }
      }

      if (canset) {
        client.hmset("ingredient:"+req.body.name, "name", req.body.name, "desc", req.body.desc, (error, reply) => {
          client.rpush("list:ingredients", req.body.name, (error, reply) => {
            res.send("Saved into liste!");
          });
        });
      } else {
        res.send("Already exists");
      }
    });
});

app.post("/ingredients", (req, res) => {
  var canupdate = false;

  client.lrange("list:ingredients", "0", "-1", (error, reply) => {
    for (var j = 0; j<reply.length; j++) {
      if (reply[i] == req.body.name) {
        canset = true;
        break;
      }
    }

    // TODO let only update was was provided
    if (canset) {
      client.hmset("ingredient:"+req.body.name, "name", req.body.name, "desc", req.body.desc, (error, reply) => {
        client.rpush("list:ingredients", req.body.name, (error, reply) => {
          res.send("Updated into list");
        });
      });
    } else {
      res.send("Entry did not exist");
    }
  });
});

app.delete("/ingredients/:ingredient", (req, res) => {
  var candelete = false;
  client.lrange("list:ingredients", "0", "-1", (error, reply) => {
    for (var j = 0; j<reply.length; j++) {
      if(reply[i] == req.body.name) {
        candelete = true;
        break;
      }
    }

    if (candelete) {
      client.del("ingredient:"+req.body.name, (error, reply) => {
        client.lrem("list:ingredients", "0", req.body.name, (error, reply) => {
          res.send("DELETION SUCCESSFUL");
        });
      });
    } else {
      res.send("NON EXISTENT ENTRY COULD NOT BE DELETED");
    }
  });
});

// KAVSEK, HILDEBRAND & PROTT
app.get("/cocktails/:name/ingredients", (req, res) => {

});

app.post("/cocktails/:name/ingredients", (req, res) => {

});

app.listen(3001, '0.0.0.0', function(){
  console.log("Zeit für ein Rein-Raus-Spiel auf Port 3000");
});
