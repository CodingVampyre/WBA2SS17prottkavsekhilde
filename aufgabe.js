'use strict'

var fs = require('fs');
var chalk = require('chalk');

fs.readFile("staedte.json", (err, dat) => {

  // parsing filestream to json and SORT
  var cities = JSON.parse(dat).cities;
  cities.sort(mySort);

  // CONVERT TO JS-STRING
  var stringified = JSON.stringify(cities);
  fs.writeFile("updatedcities.json", stringified, (err) => {
    if (err) throw err;
    console.log("ERROR: SUCCESS!");
  });

  getData(cities);

});

// OUTPUT
function getData(dat) {
  for (var i=0; i<dat.length; i++) {
    console.log(chalk.red("Name: ", dat[i].name));
    console.log(chalk.green("Name: ", dat[i].country));
    console.log(chalk.blue("Name: ", dat[i].population));
    console.log("--------");
  }
}

function mySort(a, b) {
  return a.population - b.population;
}
