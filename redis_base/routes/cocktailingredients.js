module.exports = (app, jsonparser, client) => {
    //POST COCKTAIL INGREDIENTS
    app.post("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {

        var allname = "cocktails:" + req.params.name + ":ingredients";

        client.lrange(allname, "0", "-1", (error, reply) => {

            if (reply.length == 0) {
                req.body.forEach((element) => {

                    client.hmset("ingredient:" + element.ingr, "name", element.ingr, "desc", element.meng, (error, reply) => {
                        client.rpush(allname, element.ingr, (error, listreply) => {
                            client.hset("inme:" + req.params.name, element.ingr, element.meng, (error2, reply2) => {
                                /*
                                * Writes into an inme:[name] hash
                                */
                            });
                        });
                    });
                });
            } else {
                client.lrange(allname, "0", "-1", (errr, repp) => {
                });
            }
        });
        next();
    });


    //CALLBACK POST COCKTAIL INGREDIENTS
    app.post("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        res.set({ 'Content-Type': 'application/json' });
        res.status(201);
        res.write("Oki Doki");
        res.end();
    });

    //PUT COCKTAIL INGREDIENTS
    app.put("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        var allname = "cocktails:" + req.params.cocktail_name + ":ingredients";
        console.log("Request: " + JSON.stringify(req.body));

        client.hset("inme:" + req.params.name, req.body.ingr, req.body.meng, (error, reply) => {
            client.rpush(allname, req.params.ingr, (error, listreply) => {
                if (!error) {
                    res.status(200);
                    res.end();
                } else {

                    console.log(JSON.stringify(error + " :)"));

                    res.status(500);
                    res.end();
                }

            });
        });
    });


    // GET COCKTAILS INGREDIENTS
    app.get("/cocktails/:name/ingredients", jsonparser, (req, res) => {
        client.hgetall("inme:" + req.params.name, (error, reply) => {

            var dummy = {
                "Keine": "Da ist irgendwas schief gelaufen"
            };

            res.set({ 'Content-Type': 'application/json' });
            if (!reply) {
                res.status(404);
                res.write(JSON.stringify(dummy)); // Keinen Dummy mitsenden
            } else {
                res.status(200);
                res.write(JSON.stringify(reply));
            }
            res.end();
        });
    });
    /*
    //PUT COCKTAILS INGREDIENTS
    app.put("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        var canset = true;
        client.lrange("cocktails:" + req.name + ":ingredients", "0", "-1", (error, reply) => {
            if (reply.length) {
                req.body.ingredients.forEach((element) => {
                    reply.forEach((entryInList) => {
                        req.body.forEach((newElement) => {
                            if (entryInList.name == newElement.name) {
                                canset = false;
                            }
                        });
                        if (canset) {
                            client.hmset("ingredient:" + element.name, "name", element.name, "desc", element.desc, (error, reply) => {
                                client.rpush("cocktails:" + element.name + ":ingredients", element.name, (error, listreply) => { });
                            });
                        }
                    });
                });
            }
        });
        next();
    });

    //CALLBACK PUT COCKTAIL INGREDIENTS
    app.put("/cocktails/:name/ingredients", jsonparser, (req, res, next) => {
        res.set({ 'Content-Type': 'application/json' });
        res.status(200);
        res.write(JSON.stringify(reply));
        res.end();
    });
    */

    //DELETE COCKTAIL INGREDIENTS
    app.delete("/cocktails/:cocktail_name/ingredients/:ingredient_name", jsonparser, (req, res, next) => {
        var candelete = false;
        var allname = "cocktails:" + req.params.cocktail_name + ":ingredients";
        client.hget("inme:" + req.params.cocktail_name, req.params.ingredient_name, (error, reply) => {

            if (!error) {

                if (reply != null) {
                    console.log("Exists!");
                    client.hdel("inme:" + req.params.cocktail_name, req.params.ingredient_name, (error, reply) => {
                        if (!error) {
                            res.set({ 'Content-Type': 'text/plain' });
                            res.status(200);
                            res.end();

                        } else {
                            res.status(500);
                            res.json(error);
                            res.end();
                        }
                    });
                } else {
                    res.status(404);
                    res.end();
                }

            } else {
                res.status(500);
                res.end();
            }
            console.log("REPLY: " + JSON.stringify(reply));
            /*   for (var j = 0; j < reply.length; j++) {
                   if (reply[j] == req.params.ingredient_name) {
                       candelete = true;
                       break;
                   }
               }*/


        });
    });

}