/**
 * This file contains the method to add the functions to some html elements on
 * the search.html file
 * 
 * Dependencies: sql.js, d3.js, function-plot.js, math.js, numeric-1.2.6.js,
 * math2.js, mask.js, matrixOperations.js, pointEvaluation.js,
 * pointEvaluation2.js gauss2.js, dbMethods.js, jQuery.js
 */

function setHtmlFunctions() {
//	document.getElementById('select-family').onchange = function() {
//		console.log(document.getElementById('select-family').value);
//	}
	
	updateSearchList();
	$("#select-family").change(updateSearchList);
	
	/*limitInt(document.getElementById('input-exactness-poly-approx'));
	limitFloat(document.getElementById('select-critical-hoelder-exponent'));
	limitFloat(document.getElementById('select-critical-sobolev-exponent'));
	limitInt(document.getElementById('select-spline-order'));*/
	
	var cond = new Array();
	// reduce the size of digit-length to the maximum-length
	// following is added to the scf-plot button:
	document.getElementById('button-search').onclick = search;
//		cond[0] = [ document.getElementById('select-orthogonal-translates').name,
//				document.getElementById('select-orthogonal-translates').value ];
//		cond[1] = [ document.getElementById('select-symmetry').name,
//				document.getElementById('select-symmetry').value ];
//		cond[2] = [ document.getElementById('input-exactness-poly-approx').name,
//				document.getElementById('input-exactness-poly-approx').value ];
//		cond[3] = [ document.getElementById('select-critical-hoelder-exponent').name,
//				document.getElementById('select-critical-hoelder-exponent').value ];
//		cond[4] = [ document.getElementById('select-critical-sobolev-exponent').name,
//				document.getElementById('select-critical-sobolev-exponent').value ];
//		cond[5] = [ document.getElementById('select-spline-order').name,
//				document.getElementById('select-spline-order').value ];
//		var table = document.getElementById('select-family').value;
//		var str =  genFilterString(cond);
//		console.log(str);
//		var tables = ["OMRA", "BiMRA", "BiMRAI"];
//		var search_results = [];
//		if(table == "*"){
//			for (var i = 0; i < tables.length; i++) {
//				var newstr = "SELECT * FROM " + tables[i] + " WHERE " + str;
//				console.log(newstr);
//				search_results.push(db.exec(newstr));
//			}
//		}
//		else{
//			var newstr = "SELECT * FROM " + table + " WHERE " + str;
//			var search_results = db.exec(newstr);
//			console.log(newstr);
//		}
//
//	};
}

 /* updates the list containing the scaling functions complying the conditions
 * given in the html elements (last modification: 1.7.16 Simon)
 */
function updateScfList() {
	var cond = new Array();
	// Validation of number-inputs
	// reduce the size of digit-length to the maximum-length
	limitInt(document.getElementById('input-exactness-poly-approx'));
	limitFloat(document.getElementById('select-critical-hoelder-exponent'));
	limitFloat(document.getElementById('select-critical-sobolev-exponent'));
	limitInt(document.getElementById('select-spline-order'));
	
	cond[0] = [ document.getElementById('select-orthogonal-translates').name,
			document.getElementById('select-orthogonal-translates').value ];
	cond[1] = [ document.getElementById('select-symmetry').name,
			document.getElementById('select-symmetry').value ];
	cond[2] = [ document.getElementById('input-exactness-poly-approx').name,
			document.getElementById('input-exactness-poly-approx').value ];
	cond[3] = [ document.getElementById('select-critical-hoelder-exponent').name,
			document.getElementById('select-critical-hoelder-exponent').value ];
	cond[4] = [ document.getElementById('select-critical-sobolev-exponent').name,
			document.getElementById('select-critical-sobolev-exponent').value ];
	cond[5] = [ document.getElementById('select-spline-order').name,
			document.getElementById('select-spline-order').value ];
	var str =  genFilterString(cond);
	var newstr = "SELECT * FROM scalingfunctionsSupp WHERE " + str;
	var currentdb = db.exec(newstr);
	
	console.log(str);
}


/**
 * Limitation of float-number-input-size. (last modification: 18.8.16 Andreas)
 * 
 * @param{html-input-element} element.
 * 
 */
function limitFloat(element){
	var max_int_digits = 3;
	var max_decimal_digits = 6;	// i.e. 0.1234
	
	var n = element.value;
	
	var int_portion = Math.floor(Math.abs(n));
	var decimal_portion = (Math.round(Math.abs(n)*10000 - int_portion*10000)
			/10000).toFixed(4);
	
	var int_portion_length = getNumberlength(int_portion);
	var int_diff = getNumberlength(int_portion) - max_int_digits;
	if(int_diff > 0){
		int_portion = int_portion.toString().substring(int_diff,
				int_portion_length + 1);
	}
	
	decimal_portion = decimal_portion.toString().substring(2,
			max_decimal_digits);
	n = Math.sign(n)*int_portion + "." + decimal_portion;
	
	element.value = n;
}

/**
 * Limitation of integer-number-input-size. (last modification: 18.8.16 Andreas)
 * 
 * @param{html-input-element} element.
 * 
 */
function limitInt(element){
	var max_int_digits = 3;

	var n = element.value;
	
	var sign_n = Math.sign(n);
	var int_portion = Math.floor(Math.abs(n));
	
	var int_portion_length = getNumberlength(int_portion);
	var int_diff = getNumberlength(int_portion) - max_int_digits;
	
	if(int_diff > 0){
		int_portion = int_portion.toString().substring(int_diff,
				int_portion_length + 1);
	}
	
	n = sign_n*int_portion;
	
	element.value = n;
}

/**
 *	add search-options from a column in the db to a search-selection-element.
 */
function addSearchOption(table_name, column_name, select_jq_id) {
	var entries = getDifferingColEntries(column_name, table_name);
	var select_entry_jq = $(select_jq_id);
	// from jQuery 1.6 you can't get a handle to the options using 
	// .attr('options') but it can be done with .prop('options') instead
	var selectedEntry = "*";
	if(select_entry_jq.prop) {
	  var options = select_entry_jq.prop('options');
	}
	else {
	  var options = select_entry_jq.attr('options');
	}
	
	if(entries.length > 1){
		options[0] = new Option("Show all", "*");
	}
	else{
		selectedEntry = entries[0];
	}
	
	var entry_selection_options = createSelectionOptions(entries);
	$.each(entry_selection_options, function(val, text) {
	    options[options.length] = new Option(text, val);
	});
	
	select_entry_jq.val(selectedEntry);
}

/**
 *  add floating point input (html-elements).
 */
function addFloatInput(parent, name, value, min, step, max, max_length){
	var p_elt = document.createElement("P");
	var p_elt_text = document.createTextNode(name+":");
	p_elt.appendChild(p_elt_text);

	var input_entry = document.createElement("INPUT");
	input_entry.id = "input-"+name;
	input_entry.name = name+" =";
	input_entry.type = "number";
	input_entry.value = value;
	input_entry.min = min;
	input_entry.step = step;
	input_entry.max = max;
	input_entry.max_length = max_length;
	
	parent.appendChild(p_elt);
	parent.appendChild(input_entry);
}

/**
 *  add search selection (html-elements).
 */
function addSearchSelection(parent, name){
	var p_elt = document.createElement("P");
	var p_elt_text = document.createTextNode(name+":");
	p_elt.appendChild(p_elt_text);

	var select_entry = document.createElement("SELECT");
	select_entry.id = "select-"+name;
	select_entry.name = name+" =";
	
	parent.appendChild(p_elt);
	parent.appendChild(select_entry);
}


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

/**
 * create list with search results
 */

function createResultList(parent, name_column){
	for (var i = 0; i < name_column.length; i++) {
		var list_item = document.createElement("li");
		list_item.classList.add('listitem');
		
		var list_item_form = document.createElement("form");
		list_item_form.action = "Ftemplate3.html";
		list_item_form.method = "GET";
		list_item.appendChild(list_item_form);
		
		var list_item_input = document.createElement("input");
		list_item_input.type = "submit";
		list_item_input.name = "name";
		list_item_input.value = name_column[i][0];
		
		// generate two hidden input fields to send multiple values via query
//		var list_item_input_hidden = document.createElement("input");
//		list_item_input_hidden.type = "hidden";
//		list_item_input_hidden.name = "id";
//		list_item_input_hidden.value = i + 1;
//		list_item_input.appendChild(list_item_input_hidden);
		
//		var list_item_input_hidden1 = document.createElement("input");
//		list_item_input_hidden1.type = "hidden";
//		list_item_input_hidden1.name = "table";
//		list_item_input_hidden1.value = "OMRA";
//		list_item_input.appendChild(list_item_input_hidden1);
		
		list_item_form.appendChild(list_item_input);
		
		// parent = result_list_dom
		parent.appendChild(list_item);
	}
}

/**
* update search list
*/

function updateSearchList() {
	var family = document.getElementById("select-family").value;
	
	var advanced_search_options_dom = document.getElementById("advanced-search-options");
	var advanced_search_options_jq = $("#advanced-search-options");
	
	advanced_search_options_jq.empty();
	
	if(family == "'BiMRA'"){
		// create search html elements
		addSearchSelection(advanced_search_options_dom, "type")
		addSearchSelection(advanced_search_options_dom, "symmetry");
		
		// create floating point input fields
		addFloatInput(advanced_search_options_dom, "critical Sobolev exponent", 0, 0, 0.0001, 100, 3)
		addFloatInput(advanced_search_options_dom, "critical Hoelder exponent", 0, 0, 0.0001, 100, 3)
		addFloatInput(advanced_search_options_dom, "polynomial exactness", 0, 0, 1, 100, 3)
		addFloatInput(advanced_search_options_dom, "spline order", -1, -1, 1, 100, 3)
		
		// add search options to the html elements
		addSearchOption("BiMRA", "type", "#select-type");
		addSearchOption("BiMRA", "symmetry", "#select-symmetry");
	}
	if(family == "'BiMRAI'"){
		// create search html elements
		// j_0
		addSearchSelection(advanced_search_options_dom, "j_0")
		addSearchSelection(advanced_search_options_dom, "type")
		addSearchSelection(advanced_search_options_dom, "border_conditions");
		
		// add search options to the html elements			
		addSearchOption("BiMRAIWavelets", "type", "#select-type");
		addSearchOption("BiMRAIWavelets", "border_conditions", "#select-border_conditions");
		
		// j_0
		//addSearchOption("BiMRAIWavelets", "j_0", "#select-j0");
		
		var j0s = (getDifferingColEntries("j_0", "BiMRAIWavelets")).sort();
		var selectedj0 = "*";
		var select_j0_jq = $("#select-j_0");
		// from jQuery 1.6 you can't get a handle to the options using 
		// .attr('options') but it can be done with .prop('options') instead
		if(select_j0_jq.prop) {
		  var options = select_j0_jq.prop('options');
		}
		else {
		  var options = select_j0_jq.attr('options');
		}
		
		options[0] = new Option("Show all", "*");
		
		var j0_selection_options = createSelectionOptions(j0s);
		$.each(j0_selection_options, function(val, text) {
		    options[options.length] = new Option(text, val);
		});
		
		select_j0_jq.val(selectedj0);
		
		//console.log(types[0]);
		//console.log();
		
	}
	if(family == "'OMRA'"){
		// create search html elements
		addSearchSelection(advanced_search_options_dom, "type")
		addSearchSelection(advanced_search_options_dom, "symmetry");
		
		// create floating point input fields
		addFloatInput(advanced_search_options_dom, "critical Sobolev exponent", 0, 0, 0.0001, 100, 3)
		addFloatInput(advanced_search_options_dom, "critical Hoelder exponent", 0, 0, 0.0001, 100, 3)
		addFloatInput(advanced_search_options_dom, "polynomial exactness", 0, 0, 1, 100, 3)
		
		// add search options to the html elements
		addSearchOption("OMRA", "type", "#select-type");
		addSearchOption("OMRA", "symmetry", "#select-symmetry");
	}
}

function search(){
	var family = document.getElementById("select-family").value;
	var result_list_dom = document.getElementById("search_result_list");
	var result_list_jq = $("#search_result_list");
	result_list_jq.empty();
	
	var families = ["'BiMRA'", "'OMRA'", "'BiMRAIWavelets'"];
	if(family == "*"){
		console.log("family: Show all");
		for (var i = 0; i < families.length; i++) {
			var name_column = db.exec("SELECT name FROM "+families[i]);
			name_column = name_column[0].values;
			createResultList(result_list_dom, name_column);
		}	
	}
	else{
		if(family == "'BiMRA'"){
			var critical_sobolev_exponent = document.getElementById("input-critical Sobolev exponent").value;
			var critical_hoelder_exponent = document.getElementById("input-critical Hoelder exponent").value;
			var polynomial_exactness = document.getElementById("input-polynomial exactness").value;
			var spline_order = document.getElementById("input-spline order").value;
			var symmetry = document.getElementById("select-symmetry").value;
			var type = document.getElementById("select-type").value;
			console.log("critical_sobolev_exponent>="+critical_sobolev_exponent+
					"\n critical_hoelder_exponent="+ critical_hoelder_exponent+
					"\n polynomial_exactness="+polynomial_exactness+
					"\n spline_order="+spline_order+
					"\n symmetry="+symmetry+
					"\n type="+type)
					
			var name_column = db.exec("SELECT name FROM BiMRA WHERE "+
			"critical_Sobolev_exponent >= " + critical_sobolev_exponent + 
			" AND critical_Hoelder_exponent >= " + critical_hoelder_exponent + 
			" AND exactness_of_polynomial_approximation >= " + polynomial_exactness + 
			" AND spline_order >= " + spline_order);
		}
		
		if(family == "'BiMRAI'"){
			var j_0 = document.getElementById("select-j_0").value;
			var type = document.getElementById("select-type").value;
			var border_condition = document.getElementById("select-border_conditions").value;
			console.log("j_0="+j_0+
					"\n border_conditions="+border_condition+
					"\n type="+type);
			if(j_0 == "*"){
				var name_column = db.exec("SELECT name FROM BiMRAIWavelets");
			}
			else{
				var name_column = db.exec("SELECT name FROM BiMRAIWavelets WHERE j_0 = " + j_0);
			}
		}
		if(family == "'OMRA'"){
			var critical_sobolev_exponent = document.getElementById("input-critical Sobolev exponent").value;
			var critical_hoelder_exponent = document.getElementById("input-critical Hoelder exponent").value;
			var polynomial_exactness = document.getElementById("input-polynomial exactness").value;
			var symmetry = document.getElementById("select-symmetry").value;
			var type = document.getElementById("select-type").value;
			console.log("critical_sobolev_exponent="+critical_sobolev_exponent+
					"\n critical_hoelder_exponent="+ critical_hoelder_exponent+
					"\n polynomial_exactness="+polynomial_exactness+
					"\n symmetry="+symmetry+
					"\n type="+type)
			
			var sql_string = "SELECT name FROM OMRA WHERE "+
			"critical_Sobolev_exponent >= " + critical_sobolev_exponent + 
			" AND critical_Hoelder_exponent >= " + critical_hoelder_exponent + 
			" AND exactness_of_polynomial_approximation >= " + polynomial_exactness;
			if(type != "*"){
				sql_string += " AND type = '"+ type +"'";
			}
			if(symmetry != "*"){
				sql_string += " AND symmetry = '"+ symmetry +"'";
			}
			var name_column = db.exec(sql_string);		
		}
		
		if(name_column.length == 0){
			console.log("no matching results.");
		}
		else{
			name_column = name_column[0].values;
			createResultList(result_list_dom, name_column);	
		}
	}
}