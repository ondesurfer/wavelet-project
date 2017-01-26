/**
 *	This file contains the method to add the functions to some html elements on
 * 	the Ftemplate2.html file
 * 
 * 	Dependencies:
 * 	sql.js, dbMethods.js
 */

function setHtmlFunctions() {
	var type_column = db.exec("SELECT type FROM OMRA")[0].values;
	var types = new Array();
	var type_tmp = type_column[1][0];
	var string_list = "";
	
	for (var i = 0; i < type_column.length; i++) {
		if(type_tmp != type_column[i][0]){
			types.push(type_column[i][0]);
			type_tmp = type_column[i][0];
			string_list += type_column[i][0] + "<br>";
		}
	}
	console.log(types[0]);
	
	document.getElementById('type_list').innerHTML = string_list;
	
//	document.getElementById('select-derivative-order').onchange = function() {
//		var idOfScf = document.getElementById('select-primal-scfs').value;
//		var scf = db.exec("SELECT type FROM OMRA");
//		var hoelder_order = scf[7];
//		var derivative_order = document.getElementById('select-derivative-order').value;
//		//var no_derivative_name_list = [""];
//		
//		// Fehlerabfrage noetig!!
//		if(derivative_order<hoelder_order)	{
//			var c_t = getCoeffs(document.getElementById('select-primal-scfs').value);
//			// calculates the new derivative values and saves it globally
//			valuesDer = iterativePointEvaluation2(c_t[0], c_t[1], 14,
//					parseInt(derivative_order));
//			// updates the data of the plotInstance2 object
//			plotInstance2.draw();
//		}
//		else{
//			alert("Scaling function has not enough regularity");
//		}
//	};
	//console.log(type_column);
}


/**
 * Converts a String of the form "1, 2, 3; 4" to an array as [1;2;3;4]. warning:
 * there is no test if the input is right. The input format must be "1.23, 4.56;
 * ... ; 7.89" (last modification: 15.7.16 Simon)
 * 
 * @param{String} coeffsAsString String only containing numbers an "," or ";"
 * 
 * @return{array} array Array containing the numbers
 */

function stringToNoArray(coeffsAsString) {
	try {
		var str = "";
		var array = new Array();
		for (i = 0; i < coeffsAsString.length; i++) {

			if (coeffsAsString.charAt(i) == ","
					|| coeffsAsString.charAt(i) == ";") {
				var number = parseFloat(str.trim());
				array.push(number);
				str = "";
			} else {
				str = str + coeffsAsString.charAt(i);
			}
		}
		if(str.trim().length>0){
			var number = parseFloat(str.trim());
			array.push(number);
		}
		// console.log(array);
		return array;
	} catch (err) {
		console.log(err.message);
	}
}