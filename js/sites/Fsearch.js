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
	
	$("#select-family").change(function () {
		var family = this.value;
		var advanced_search_options_dom = document.getElementById("advanced-search-options");
		var advanced_search_options_jq = $("#advanced-search-options");
		
		advanced_search_options_jq.empty();
		
		if(family == "'BiMRA'"){
			console.log("a");
		}
		if(family == "'BiMRAI'"){
			console.log("b");
			
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
			var selectedj0 = "Show all";
			var select_j0_jq = $("#select-j_0");
			// from jQuery 1.6 you can't get a handle to the options using 
			// .attr('options') but it can be done with .prop('options') instead
			if(select_j0_jq.prop) {
			  var options = select_j0_jq.prop('options');
			}
			else {
			  var options = select_j0_jq.attr('options');
			}
			
			options[0] = new Option("Show all", "Show all");
			
			var j0_selection_options = createSelectionOptions(j0s);
			$.each(j0_selection_options, function(val, text) {
			    options[options.length] = new Option(text, val);
			});
			
			select_j0_jq.val(selectedj0);
			
			//console.log(types[0]);
			//console.log();
			
		}
		if(family == "'OMRA'"){
			console.log("c");
		}
		 
		 
	});
	
	/*limitInt(document.getElementById('input-exactness-poly-approx'));
	limitFloat(document.getElementById('select-critical-hoelder-exponent'));
	limitFloat(document.getElementById('select-critical-sobolev-exponent'));
	limitInt(document.getElementById('select-spline-order'));*/
	
	var cond = new Array();
	// reduce the size of digit-length to the maximum-length
	// following is added to the scf-plot button:
	document.getElementById('button-search').onclick = function() {
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
		var table = document.getElementById('select-family').value;
		var str =  genFilterString(cond);
		console.log(str);
		var tables = ["OMRA", "BiMRA", "BiMRAI"];
		var search_results = [];
		if(table == "*"){
			for (var i = 0; i < tables.length; i++) {
				var newstr = "SELECT * FROM " + tables[i] + " WHERE " + str;
				console.log(newstr);
				search_results.push(db.exec(newstr));
			}
		}
		else{
			var newstr = "SELECT * FROM " + table + " WHERE " + str;
			var search_results = db.exec(newstr);
			console.log(newstr);
		}

	};

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
	var selectedEntry = "Show all";
	var select_entry_jq = $(select_jq_id);
	// from jQuery 1.6 you can't get a handle to the options using 
	// .attr('options') but it can be done with .prop('options') instead
	if(select_entry_jq.prop) {
	  var options = select_entry_jq.prop('options');
	}
	else {
	  var options = select_entry_jq.attr('options');
	}
	
	options[0] = new Option("Show all", "Show all");
	
	var entry_selection_options = createSelectionOptions(entries);
	$.each(entry_selection_options, function(val, text) {
	    options[options.length] = new Option(text, val);
	});
	
	select_entry_jq.val(selectedEntry);
}

/**
 *  add search selection (html-element).
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