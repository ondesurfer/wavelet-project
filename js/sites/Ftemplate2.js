/**
 *	This file contains the method to add the functions to some html elements on
 * 	the Ftemplate2.html file
 * 
 * 	Dependencies:
 * 	sql.js, dbMethods.js
 */

function setHtmlFunctions() {
	var type_column = db.exec("SELECT type FROM OMRA")[0].values;
	var name_column = db.exec("SELECT name FROM OMRA")[0].values;
	var types = new Array();
	var type_tmp = "";
	
	var type_list = document.getElementById("type_list");
	
	// same types have to be neighbors 
	for (var i = 0; i < type_column.length; i++) {
		if(type_tmp != type_column[i][0]){
			types.push(type_column[i][0]);
			type_tmp = type_column[i][0];
			
			var button = document.createElement("BUTTON");
			button.classList.add('typebutton');
			
			var button_text = document.createTextNode(type_column[i][0]);
			button.appendChild(button_text);
			button.id = type_column[i][0]+"button";
			
			var type_list_entry = document.createElement("u1");
			type_list_entry.id = type_column[i][0] + "list";
			type_list_entry.style.display = "block";
			
			// seperate lists
			var br = document.createElement("br");
			
			//type_list_entry.style.display = "none";
			type_list.appendChild(button); 
			type_list.appendChild(type_list_entry);
			type_list.appendChild(br);
		}
		
		var list_item = document.createElement("li");
		
		var list_item_form = document.createElement("form");
		list_item_form.action = "Ftemplate3.html";
		list_item_form.method = "GET";
		list_item.appendChild(list_item_form);
		var list_item_input = document.createElement("input");
		list_item_input.type = "submit";
		list_item_input.name = "name";
		list_item_input.value = name_column[i][0];
		
		// generate two hidden input fields to send multiple values via query
		var list_item_input_hidden = document.createElement("input");
		list_item_input_hidden.type = "hidden";
		list_item_input_hidden.name = "id";
		list_item_input_hidden.value = i + 1;
		list_item_input.appendChild(list_item_input_hidden);
		
		var list_item_input_hidden1 = document.createElement("input");
		list_item_input_hidden1.type = "hidden";
		list_item_input_hidden1.name = "table";
		list_item_input_hidden1.value = "OMRA";
		list_item_input.appendChild(list_item_input_hidden1);
		
		list_item_form.appendChild(list_item_input);
		
		var list = document.getElementById(type_column[i][0] + "list");
		list.appendChild(list_item);
	}
	
	// add hide/show-action to the buttons
	for (var i = 0; i < types.length; i++) {
		var button = document.getElementById(types[i] + "button");
		var list = document.getElementById(types[i] + "list");
		//console.log(list.id);
		button.addEventListener("click", function() {
			var list1 = document.getElementById(list.id);
			if(list1.style.display == "none"){
				list1.style.display = "block";
			}
			else{
				list1.style.display = "none";
			}
		});
	}
	
	//test
//	var p = document.createElement("P");
//	p.innerHTML = "Look ma, this is a new paragraph!";
//	p.id = "newParagraph";
//
//	// make element part of the DOM
//	document.getElementsByTagName("BODY")[0].appendChild(p);
//
//	// get element by ID
//	var test = document.getElementById("newParagraph");
//	alert(test.innerHTML);
	
	//console.log(type_tmp+"list");
	//document.getElementById(type_tmp+'list').innerHTML = "<li class ='type-list-element'>"+name_column[0][0]+"</li>";
	
	//document.getElementById('type_list').innerHTML = string_list;
	
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