module.exports = (app, jsonparser, client) => {

  //GET ALL USERS
  app.get("/users", (req, res) => {
    client.lrange("list:users", "0", "-1", (error, reply) => {
      res.set({ 'Content-Type': 'application/json' });
      res.status(200);
      res.write(JSON.stringify(reply));
      res.end();
    });
  });

  //GET SINGLE USER
  app.get("/users/:id", (req, res) => {
    client.hgetall("user:" + req.params.id, (error, reply) => {
      res.set({ 'Content-Type': 'application/json' });
      res.status(200);
      res.write(JSON.stringify(reply));
      res.end();
    });
  });

  //POST NEW USER
  app.post("/users", jsonparser, (req, res) => {
    var canset = true;

    client.lrange("list:users", "0", "-1", (error, reply) => {

      for (var i = 0; i < reply.length; i++) {
        if (reply[i] == req.body.name) canset = false;
      }

      if (canset) {
        client.hmset("user:" + req.body.name, "name", req.body.name, "mail", req.body.mail, "pass", req.body.pass, (error, reply) => {
          client.rpush("list:users", req.body.name, (error, listreply) => {
            res.set({ 'Content-Type': 'application/json' });
            res.status(201);
            res.write(JSON.stringify(reply));
            res.end();
          });
        });
      } else {
        res.set({ 'Content-Type': 'text/plain' });
        res.status(400);
        res.write('OBJECT ALREADY EXISTS');
        res.end();
      }
    });
  });

  //PUT USER
  app.put("/users", jsonparser, (req, res) => {
    var canupdate = false;

    client.lrange("list:users", "0", "-1", (error, reply) => {
      for (var j = 0; j < reply.length; j++) {
        if (reply[j] == req.body.name) {
          canupdate = true;
          break;
        }
      }

      // TODO Update should only be allowed if the provided user-entry is existent
      if (canupdate) {
        client.hmset("user:" + req.body.name, "name", req.body.name, "email", req.body.email, "pass", req.body.pass, (error, reply) => {
          res.set({ 'Content-Type': 'text/plain' });
          res.status(200);
          res.write('SUCCESS: UPDATE USER');
          res.end();
        });
      } else {
        res.set({ 'Content-Type': 'text/plain' });
        res.status(404); //TODO END
        res.write('ERROR: NO OBJECT IN DATABASE');
        res.end();
      }
    });
  });

  //DELETE USER
  app.delete("/users/:id", jsonparser, (req, res) => {
    var candelete = false;

    client.lrange("list:users", "0", "-1", (error, reply) => {
      for (var j = 0; j < reply.length; j++) {
        if (reply[j] == req.body.name) {
          candelete = true;
          break;
        }
      }

      if (candelete) {
        client.del("user:" + req.body.name, (error, reply) => {
          client.lrem("list:users", "0", req.body.name, (error, reply) => {
            res.set({ 'Content-Type': 'text/plain' });
            res.status(200);
            res.write('SUCCESS: DELETE USER');
            res.end();
          });
        });
      } else {
        res.set({ 'Content-Type': 'text/plain' });
        res.status(404);
        res.write('ERROR: NO OBJECT IN DATABASE');
        res.end();
      }
    });
  });

}