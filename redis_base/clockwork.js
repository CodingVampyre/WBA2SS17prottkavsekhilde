var express = require("express");
var client = require("redis").createClient();
var bodyParser = require("body-parser");
var app = express();

const PORT = process.argv[2] || 8081;

app.use(bodyParser.urlencoded({
  extended: true
}));
var jsonparser = bodyParser.json();

var users = require("./routes/users")(app, jsonparser, client);
var cocktails = require("./routes/cocktails")(app, jsonparser, client);
var igredients = require("./routes/ingredients")(app, jsonparser, client);
var comments = require("./routes/comments")(app, jsonparser, client);
var cocktailingredients = require("./routes/cocktailingredients")(app, jsonparser, client);

//LISTEN
app.listen(PORT, '0.0.0.0', function () {
  console.log("Port is ready for take off: " + PORT);
});

// DELETES ALL DATA :-)
app.get("/flushall", jsonparser, (req, res) => {
  client.flushall((error, reply) => {
    res.set({ 'Content-Type': 'application/json' });
    res.status(201);
    res.write("Alles gut");
    res.end();
  });
})

