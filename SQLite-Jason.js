// JavaScript Document


// ueber die Konsole muss sqlite-to-json und sqlite3 installiert werden. Dazu sind folgende Befehle notwendig:
// in dem Ordner wo die Datein liegen ausfuehren!!!
// npm install   sqlite3
//npm install sqlite-to-json

const SqliteToJson = require('sqlite-to-json');
const sqlite3 = require('sqlite3');
const exporter = new SqliteToJson({
  client: new sqlite3.Database('./ScalingFunctions.sqlite3')
});
exporter.save('ScalingFunctionsSupp', './ScalingFunctionsSupp.json', function (err) {
  // no error and you're good. 
});