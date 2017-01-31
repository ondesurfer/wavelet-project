/**
 *	This file contains the method to add the functions to some html elements on
 * 	the Ftemplate2.html file
 * 
 * 	Dependencies:
 * 	sql.js, dbMethods.js
 */

function setHtmlFunctions() {
	
	var id = getQueryVariable("id");
	var table = getQueryVariable("table");
	
	/////////////////////////////////////////
	//  1. Abschnitt/////////////////////////
	/////////////////////////////////////////
	var funct_name = db.exec("SELECT name FROM " + table + " WHERE id = " + id)[0];
	$("#function_name").text(funct_name.values[0][0]);
	
	
	///////////////////////////////////////////
	//  2.Abschnitt ///////////////////////////
	///////////////////////////////////////////
	
	if(table=="OMRA"){
		var mask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + id)[0].values[0][0]);
		var a_start = db.exec("SELECT a_start FROM " + table + " WHERE id = " + id)[0].values[0][0];
		console.log('mask',  mask, 'astart', a_start);
		valuesScf=iterativePointEvaluation2(mask, a_start, 8, 0); 
		plotInstance1.draw();
	}
	
	///////////////////////////////////////////
	//   3.Abschnitt //////////////////////////
	///////////////////////////////////////////
	var scf = db.exec("SELECT * FROM " + table + " WHERE id = " + id)[0];
	console.log ('scf', scf);
	
	var str = generateInfoString(scf);
	$(info).val(str);
	
}

// generates an string containing all information given in one database line
// input: scf - object containing line and columns of the choosen funktion in Database
function generateInfoString(scf) {
		var info = "";
		for(var column = 0; column < scf.columns.length; column++){
			//info += "<p> ";
			info += scf.columns[column];
			info += ": ";
			info += scf.values[0][column] + "\r";
		}
		console.log('info', info);
		return info;	
}