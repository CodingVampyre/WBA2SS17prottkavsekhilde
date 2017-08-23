module.exports = (app, jsonparser, client) => {

    //GET ALL COCKTAILS
    app.get("/cocktails", (req, res) => {
        client.lrange("list:cocktails", "0", "-1", (error, reply) => {
            res.set({ 'Content-Type': 'application/json' });
            res.status(200);
            res.write(JSON.stringify(reply));
            res.end();
        });
    });

    //GET SINGLE COCKTAIL
    app.get("/cocktails/:name", (req, res) => {
        client.hgetall("cocktail:" + req.params.name, (error, reply) => {
            res.set({ 'Content-Type': 'application/json' });
            if (reply != null) {
                res.status(200);
                res.write(JSON.stringify(reply));
            } else {
                res.status(404);
                res.write(JSON.stringify("NOT FOUND"));
            }
            res.end();
        });
    });

    //POST COCKTAIL
    app.post("/cocktails", jsonparser, (req, res) => {
        var canset = true;
        //console.log(req);
        client.lrange("list:cocktails", "0", "-1", (error, reply) => {

            for (var i = 0; i < reply.length; i++) {
                if (reply[i] == req.body.name) canset = false;
            }

            if (canset) {
                client.hmset("cocktail:" + req.body.name, "name", req.body.name, "desc", req.body.desc, "mail", req.body.mail, "date", req.body.date, (error, reply) => {
                    client.rpush("list:cocktails", req.body.name, (error, listreply) => {
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

    //PUT COCKTAIL
    app.put("/cocktails", jsonparser, (req, res) => {
        var canupdate = false;

        client.lrange("list:cocktails", "0", "-1", (error, reply) => {
            for (var j = 0; j < reply.length; j++) {
                if (reply[j] == req.body.name) {
                    canupdate = true;
                    break;
                }
            }
            if (canupdate) {
                client.hmset("cocktail:" + req.body.name, "name", req.body.name, "desc", req.body.desc, "mail", req.body.mail, "date", req.body.date, (error, reply) => {
                    res.set({ 'Content-Type': 'text/plain' });
                    res.status(200);
                    res.write('SUCCESS: UPDATE USER');
                    res.end();
                });
            } else {
                res.set({ 'Content-Type': 'text/plain' });
                res.status(404);
                res.write('ERROR: NO OBJECT IN DATABASE');
                res.end();
            }
        });
    });

    //DELETE COCKTAIL
    app.delete("/cocktails/:name", jsonparser, (req, res) => {
        var candelete = false;
        client.lrange("list:cocktails", "0", "-1", (error, reply) => {
            for (var j = 0; j < reply.length; j++) {
                if (reply[j] == req.params.name) {
                    candelete = true;
                    break;
                }
            }
            if (candelete) {
                client.del("cocktails:" + req.params.name, (error, reply) => {
                    client.lrem("list:cocktails", "0", req.params.name, (error, reply) => {
                        res.set({ 'Content-Type': 'text/plain' });
                        res.status(200);
                        res.write('SUCCESS: DELETE COCKTAIL');
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