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
	console.log("id="+id);
	console.log("table="+table);
	//var url_info = window.location.search;
	//var url_data = url_info.split("=");
	//console.log(url_info+' j');
	
	var funct_name = db.exec("SELECT name FROM " + table + " WHERE id = " + id)[0];
	console.log(funct_name.values[0][0]);
	
	$("#function_name").text(funct_name.values[0][0]);
	
}