'use strict'
const PORT = process.argv[2] || 8080;
const DIENSTNUTZERPORT = 8081;
const DINU_DEST = "http://127.0.0.1"

var express = require('express');
var pug = require('pug');
var fs = require('fs');
var bodyParser = require('body-parser');
var http = require('http');
var request = require('request');
var app = express();
var twit = require('twit'); // USE external API of twitter
var crypto = require('crypto');

app.set('view engine', 'pug');
app.set("views", "html_template/");
app.use('/style', express.static('style'));
app.use('/misc', express.static('misc'));

var mytwitter;
var jsonparser = bodyParser.json();
app.use(bodyParser.urlencoded({ extended: false }))

const server = app.listen(PORT, function () {

  if (PORT == undefined) {
    console.log("Please provide a port number as command parameter");
    process.exit(-1);
  }

  if (DINU_DEST == undefined) {
    console.log("Please provide the domain of the other thing like 'http://domain'");
    process.exit(-1);
  }

  fs.readFile("misc/twitter_credentials.json", jsonparser, (err, rep) => {
    mytwitter = new twit(JSON.parse(rep));
  });

  console.log("App is listening on Port " + PORT + "...");
});

var io = require('socket.io')(server);

app.get("/", (req, res) => {
  res.render("base.pug", {

  });
});


// GET LIST OF COCKTAILS
app.get("/cocktails", jsonparser, (req, res) => {

  var myurl = DINU_DEST + ':' + DIENSTNUTZERPORT + "/cocktails";

  request.get(myurl, (error, response, body) => {

    if (!error) {
      body = JSON.parse(body);
      res.render("cocktaillist.pug", {
        listi: body
      });
    } else {
      res.render("cocktaillist.pug", {
        listi: null
      });
    }
  });
});

//GET SINGLE/MARRIED COCKTAIL
app.get("/cocktails/:cocktail", jsonparser, (req, res) => {
  var cocktailname = req.params.cocktail;
  var mycocktail = DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + cocktailname;
  var mycomments = DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + cocktailname + "/comments";
  var myingredients = DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + cocktailname + "/ingredients";


  request.get(mycocktail, (error, response, body) => {

    if (!error) {
      body = JSON.parse(body);

      request.get(myingredients, (error2, response2, body2) => {

        request.get(mycomments, (error3, response3, body3) => {
          body3 = JSON.parse(body3);
          body2 = JSON.parse(body2);
          console.log(JSON.stringify(body3));

          res.render("cocktail.pug", {
            cocktail: body.name,
            description: body.desc,
            ingredients: body2,
            comments: body3
          });

        });

      });

    } else {
      res.render("cocktail.pug", {
        cocktail: "Fehler",
        description: "leider Konnten wir ihren Cock...Tail nicht finden."
      });
    }
  });
});

//DELETE COCKTAIL
app.post("/cocktails/delete", jsonparser, (req, res) => {
  console.log("This is my Body:" + JSON.stringify(req.body.cock));
  
  var domain = DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + req.body.cock;
  console.log(domain);
  
  request.delete(domain, (error, response, body) => {
    res.redirect("/cocktails");
    console.log(JSON.stringify(error));
  })
})

// GET CREATE COCKTAIL
app.get("/new/cocktail", (req, res) => {
  res.render("cocktail_form.pug", {
    title: "New Cocktail"
  });
});

// POST NEW COCKTAIL
app.post("/createnewcocktail", jsonparser, (req, res) => {
  var mymessage = "Hey droogs! There was a BRAND NEW cocktail on our site: /cocktail/" + req.body.name;

  mytwitter.post('statuses/update', { status: mymessage }, (err, data, response) => {

    var myform = { url: DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails", form: req.body };

    request.post(myform, (error, response, body) => {

      var stuff = parseZutaten(req.body.ingr);
      var ingform = { url: DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + req.body.name + "/ingredients", body: stuff, json: true };

      request.post(ingform, (error1, response1, body1) => {
        res.redirect("/cocktails/" + req.body.name);
      });

    });
  });

});

// GET SINGLE INGREDIENT
app.get("/ingredient/:name", jsonparser, (req, res) => {
  var domain = DINU_DEST + ":" + DIENSTNUTZERPORT + "/ingredients/" + req.params.name;

  request.get(domain, (error, response, body) => {

    if (!error) {

      body = JSON.parse(body);

      res.render("ingredient.pug", {
        name: body.name,
        desc: body.desc
      });

    } else {

      res.render("ingredient.pug", {
        name: "Swiggity Swooty",
        desc: "No Ingredientudy!"
      });

    }

  });

});


//GET LIST OF USERS
app.get("/users", (err, res) => {
  res.render("users.pug", {

  });
});


//GET SINGLE USER
app.get("/users/:name", jsonparser, (req, res) => {
  var domain = DINU_DEST + ":" + DIENSTNUTZERPORT + "/users/" + req.params.name;

  request.get(domain, (error, response, body) => {

    if (!error) {

      body = JSON.parse(body);

      res.render("singleuser.pug", {
        name: body.name,
        pass: body.pass,
        mail: body.mail
      });

    } else {

      res.render("ingredient.pug", {
        name: "Swiggity Swooty",
        desc: "No Ingredientudy!"
      });

    }

  });

});

//GET CREATE USER
app.get("/new/user", (req, res) => {
  res.render("user_form.pug", {
    title: "New User"
  });
});


//POST NEW USER
app.post("/createnewuser", jsonparser, (req, res) => {

  var getSpecificCocktail = DINU_DEST + ":" + DIENSTNUTZERPORT + "/user/" + req.body.name;
  var postSpecificCocktail = DINU_DEST + ":" + DIENSTNUTZERPORT + "/users";

  var hash = crypto.createHash('sha256').update(req.body.pass).digest('base64');

  var ourbody = {
    name: req.body.name,
    mail: req.body.mail,
    pass: hash
  }

  var myform = { url: postSpecificCocktail, form: ourbody };

  request.post(myform, (error, response, body) => {

    var newpost = DINU_DEST + ":" + DIENSTNUTZERPORT + "/users/" + req.body.name;

    request.get(newpost, (error, response, body) => {

      body = JSON.parse(body);
      if (!error) {
        res.render("singleuser.pug", {
          name: body.name,
          pass: body.pass,
          mail: body.mail
        });
      } else {
        res.render("singleuser.pug", {
          name: body.name,
          pass: body.pass,
          mail: body.mail
        });
      }
    });
  });
});

//POST COMMENT
app.post("/createnewcomment", jsonparser, (req, res) => {
  console.log(req.body);
  var domain = DINU_DEST + ":" + DIENSTNUTZERPORT + "/cocktails/" + req.body.cock + "/comments";
  var sendurl = { url: domain, body: req.body, json: true };

  request.post(sendurl, (error, response, body) => {
    res.redirect("/cocktails/" + req.body.cock);
  });
});

//FLUSH REDIS
app.get("/flushredis", (req, res) => {

  var domain = DINU_DEST + ":" + DIENSTNUTZERPORT + "/flushall";

  request.get(domain, (error, reply, body) => {
    res.send("Error: " + error + "\n" + "Reply: " + reply + "Body: " + body);
  });
})


//SOCKET IO
io.on('connection', (socket) => {
  console.log("Another day began, another user connected.");
  var users = DINU_DEST + ":" + DIENSTNUTZERPORT + "/users"

  // Real Time Updates Of Tweets by our account
  setInterval(() => {
    mytwitter.get("statuses/user_timeline", { name: "@CocktailsOrange", count: 1 }, (err, data, response) => {

      if (err == null) {
        var statuses = data[0];
        socket.emit('fakenews', statuses.text);
      } else {
        socket.emit('fakenews', "No Tweets on this account.");
      }
    });
  }, 5000);

  // Real Time Update of all existing Users
  setInterval(() => {
    request.get(users, (error, response, body) => {

      if (!error) {
        socket.emit('userlist', body);
      } else {
        socket.emit('userlist', null);
      }
    })
  }, 2000);

  io.on('disconnect', () => {
    console.log("Bye Bye, droog!");
  });

});

app.get('*', (req, res) => {
  res.render("404.pug", {

  })
});

function parseZutaten(zlist) {

  var mylist = [];
  var ingrActive = true;
  var mengActive = false;

  var ingri = "";
  var menge = "";

  var singlezutat = {
    ingr: null,
    meng: null
  };

  for (var i = 0; i <= zlist.length; i++) {

    if (zlist[i] == "+") {

      ingrActive = false;
      mengActive = true;

    } else if (zlist[i] == ".") {

      ingrActive = true;
      mengActive = false;

      singlezutat.ingr = ingri;
      singlezutat.meng = menge;

      mylist.push(JSON.parse(JSON.stringify(singlezutat)));

      singlezutat.ingr = null;
      singlezutat.meng = null;
      ingri = "";
      menge = "";

    } else if (zlist[i] == "\n" || zlist[i] == "\r") {

      continue;

    } else {

      if (ingrActive) {
        ingri += zlist[i];
      } else if (mengActive) {
        menge += zlist[i];
      }

    }

  }
  return mylist;
}


/*
* User mit seinen Cocktails verlinken
*/
