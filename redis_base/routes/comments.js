module.exports = (app, jsonparser, client) => {
    //GET COCKTAIL COMMENT
    app.get("/cocktails/:name/comments", jsonparser, (req, res) => {
        client.hgetall("inme2:" + req.params.name, (error, reply) => {

            console.log("Comments Reply" + JSON.stringify(reply));
            console.log("COMMENTS ERROR: " + error);
            res.set({ 'Content-Type': 'application/json' });

            var dummy =
                {
                    "Noch keine Kommentare vorhanden...":
                    "Schreibe doch einfach den Ersten!"
                }


            if (!reply) {
                res.status(404);
                res.write(JSON.stringify(dummy));
            } else {
                res.status(200);
                res.write(JSON.stringify(reply));
            }
            res.end();
        });
    });

    //POST COCKTAIL COMMENTS
    app.post("/cocktails/:name/comments", jsonparser, (req, res, next) => {

        var allcomm = "cocktails:" + req.params.name + ":comments";

        console.log("Element: " + req.body.auth + " - " + req.body.comm);

        client.hmset("comment:" + req.body.auth, "auth", req.body.auth, "comm", req.body.comm, (error, reply) => {
            client.hset("inme2:" + req.params.name, req.body.auth, req.body.comm, (error3, reply3) => {

                // Writes into an inme:[name] hash
            });
        });
        next();
    });

    // CALLBACK: POST COCKTAIL COMMENTS
    app.post("/cocktails/:name/comments", jsonparser, (req, res, next) => {
        res.set({ 'Content-Type': 'application/json' });
        res.status(201);
        res.write("Oki Doki");
        res.end();
    });
}