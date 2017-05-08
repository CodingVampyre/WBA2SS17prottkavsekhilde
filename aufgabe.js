'use strict'

var fs = require('fs');
var chalk = require('chalk');

fs.readFile("staedte.json", function(err, dat){
  dat = JSON.parse(dat); // parsing filestream to json
  var cities = dat.cities;

  // TODO EXTERNALIZE FUNCTION
  cities.sort(function(a, b) {
    return a.population - b.population;
  });

  var stringified = JSON.stringify(cities);
  fs.writeFile("updatedcities.json", stringified, (err) => {
    if (err) throw err;
    console.log("ERROR: SUCCESS!");
  });

  getData(cities);

});

function getData(dat) {
  for (var i=0; i<dat.length; i++) {
    console.log(chalk.red("Name: ", dat[i].name));
    console.log(chalk.green("Name: ", dat[i].country));
    console.log(chalk.blue("Name: ", dat[i].population));
    console.log("--------");
  }
}
