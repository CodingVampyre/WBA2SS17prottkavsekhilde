module.exports = (app, jsonparser, client) => {
    //GET ALL INGREDIENTS
    app.get("/ingredients", (req, res) => {
        client.lrange("list:ingredients", "0", "-1", (error, reply) => {
            res.set({ 'Content-Type': 'application/json' });
            res.status(200);
            res.write(JSON.stringify(reply));
            res.end();
        });
    });

    //GET SINGLE INGREDIENT
    app.get("/ingredients/:ingredient", (req, res) => {
        client.hgetall("ingredient:" + req.params.ingredient, (error, reply) => {
            res.set({ 'Content-Type': 'application/json' });
            res.status(200);
            res.write(JSON.stringify(reply));
            res.end();
        });
    });

    //POST INGREDIENT
    app.post("/ingredients", jsonparser, (req, res) => {
        var canset = true;

        client.lrange("list:ingredients", "0", "-1", (error, reply) => {

            for (var i = 0; i < reply.length; i++) {
                if (reply[i] == req.body.name) canset = false;
            }

            if (canset) {
                client.hmset("ingredient:" + req.body.name, "name", req.body.name, "desc", req.body.desc, (error, reply) => {
                    client.rpush("list:ingredients", req.body.name, (error, listreply) => {
                        res.set({ 'Content-Type': 'application/json' });
                        res.status(201);
                        res.write(JSON.stringify(reply));
                        res.end();
                    });
                });
            } else {
                res.set({ 'Content-Type': 'text/plain' });
                res.status(404);
                res.write('OBJECT ALREADY EXISTS');
                res.end();
            }
        });
    });

    //PUT INGREDIENT
    app.put("/ingredients", jsonparser, (req, res) => {
        var canupdate = false;

        client.lrange("list:ingredients", "0", "-1", (error, reply) => {
            for (var j = 0; j < reply.length; j++) {
                if (reply[j] == req.body.name) {
                    canupdate = true;
                    break;
                }
            }

            if (canupdate) {
                client.hmset("ingredient:" + req.body.name, "name", req.body.name, "desc", req.body.desc, (error, reply) => {
                    res.set({ 'Content-Type': 'text/plain' });
                    res.status(200);
                    res.write('SUCCESS: UPDATE INGREDIENT');
                    res.end();
                });
            } else {
                res.set({ 'Content-Type': 'text/plain' });
                res.status(400);
                res.write('ERROR: NO OBJECT IN DATABASE');
                res.end();
            }
        });
    });

    //DELETE INGREDIENT
    app.delete("/ingredients/:ingredient", jsonparser, (req, res) => {
        var candelete = false;

        client.lrange("list:ingredients", "0", "-1", (error, reply) => {
            for (var j = 0; j < reply.length; j++) {
                if (reply[j] == req.body.name) {
                    candelete = true;
                    break;
                }
            }

            if (candelete) {
                client.del("ingredient:" + req.body.name, (error, reply) => {
                    client.lrem("list:ingredients", "0", req.body.name, (error, reply) => {
                        res.set({ 'Content-Type': 'text/plain' });
                        res.status(200);
                        res.write('SUCCESS: DELETE INGREDIENT');
                        res.end();
                    });
                });
            } else {
                res.set({ 'Content-Type': 'text/plain' });
                res.status(400);
                res.write('ERROR: NO OBJECT IN DATABASE');
                res.end();
            }
        });
    });
}