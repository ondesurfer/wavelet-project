/**
 * this file contains the method to add the functions to some html elements on
 * the Fwavelet-plot.html file
 */

function setHtmlFunctions() {

	// updates the List if any condition is changed
	document.getElementById('select-orthogonal-translates').onchange = updateLists;
	document.getElementById('select-symmetry').onchange = updateLists;
	document.getElementById('input-exactness-poly-approx').onchange = updateLists;
	document.getElementById('select-critical-hoelder-exponent').onchange = updateLists;
	document.getElementById('select-critical-sobolev-exponent').onchange = updateLists;
	document.getElementById('select-spline-order').onchange = updateLists;

	// cleans the info field and the function plot if the choosen
	// scalingfunction is changed
	document.getElementById('select-primal-scfs').onchange = function() {
		cleanPlotAndInfo();
		updateDualScfList(this.value);

	};

	// adds the showInformation function to the showInformation button
	document.getElementById('button-show-scfs-info').onclick = function() {
		showInformation(document.getElementById('select-primal-scfs').value);

	};

	// following is added to the scf-plot button:
	document.getElementById('button-plot-scfs').onclick = function() {
		// Fehlerabfrage noetig!!
		var c_t = getCoeffs(document.getElementById('select-primal-scfs').value);
		// calculates the new derivative values and saves it globally
		valuesScf = iterativePointEvaluation2(c_t[0], c_t[1], 14, 0);
		// updates the data of the plotInstance2 object
		plotInstance1.draw();

	};

	// following is added to the wav-plot button:
	document.getElementById('button-plot-wavelet').onclick = function() {
		// Fehlerabfrage noetig!!
		var c_t = getCoeffs(document.getElementById('select-primal-scfs').value);
		var d_t = getCoeffs(document.getElementById('select-dual-scfs').value);
		// calculates the new derivative values and saves it globally
		valuesWav = waveletPointEvaluation(c_t[0], c_t[1], d_t[0], d_t[1], 13);

		// updates the data of the plotInstance3 object
		plotInstance3.draw();

	};

	// displays/hides the plot2Area when the checkBox is changed
	document.getElementById('check-show-derivative').onchange = function() {
		if (document.getElementById('check-show-derivative').checked) {
			document.getElementById('area-plot-derivative').style.display = 'block';
		} else {
			document.getElementById('area-plot-derivative').style.display = 'none';
		}
	};

	// calculates the derivation points and plots them, if the derivation order
	// input-textfield is changed
	document.getElementById('select-derivative-order').onchange = function() {
		var idOfScf = document.getElementById('select-primal-scfs').value;
		var scf = db.exec("SELECT * FROM scalingfunctionsSupp WHERE id=" + idOfScf)[0].values[0];
		var scf_name = scf[1];
		var spline_order = scf[11];
		var poly_exactness = scf[8];
		var derivative_order = document.getElementById('select-derivative-order').value;
		//var no_derivative_name_list = [""];
		
		// Fehlerabfrage noetig!!
		if(spline_order - 2 - derivative_order >= 0 || 
				(poly_exactness > 3 && derivative_order == 1)){
			var c_t = getCoeffs(document.getElementById('select-primal-scfs').value);
			// calculates the new derivative values and saves it globally
			valuesDer = iterativePointEvaluation2(c_t[0], c_t[1], 14,
					parseInt(derivative_order));
			// updates the data of the plotInstance2 object
			plotInstance2.draw();
		}
		else{
			alert("Scaling function has not enough regularity");
		}
	};
}
/**
 * resets the string in the textArea and sets the points of the plots to []
 * (last modification: 8.8.16 Andreas)
 */
function cleanPlotAndInfo() {
	document.getElementById('textarea-scfs-info').value = "";
	document.getElementById('select-derivative-order').value = "";
	valuesScf = [];
	valuesDer = [];
	plotInstance1.draw();
	plotInstance2.draw();
	cleanWaveletPlot();
	document.getElementById('select-dual-scfs').length = 0;
	var referenceLink = document.getElementById('link-reference');
	referenceLink.text = "";
}

/**
 * updates the list containing the scaling functions complying the conditions
 * given in the html elements (last modification: 1.7.16 Simon)
 */
function updateScfList() {
	cleanPlotAndInfo();
	var cond = new Array();
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
	fillList(document.getElementById('select-primal-scfs'), currentdb);
}
/**
 * updates the list containing the dual scaling functions fitting to the choosen
 * scf (last modification: 26.7.16 Simon)
 * 
 * @param id
 *            ID of the main scaling function
 */
function updateDualScfList(id) {
	cleanWaveletPlot();
	var command1 = "SELECT ID_of_dual_function FROM scalingfunctionsSupp WHERE ID ="
			+ id;
	var str = db.exec(command1)[0].values[0][0];

	if (str != undefined) {
		var noAr = stringToNoArray(str);
		var command2 = "SELECT * FROM scalingfunctionsSupp WHERE";
		for (var i = 0; i < noAr.length - 1; i++) {
			command2 += " ID = " + noAr[i] + " OR";
		}
		command2 += " ID = " + noAr[noAr.length - 1];
		// console.log(command2);
		var currentdb = db.exec(command2);
		fillList(document.getElementById('select-dual-scfs'), currentdb);
	}
	// if no dual-scf is found, the list is set empty
	else {
		console.log("no dual scalingfunction in database");
		document.getElementById('select-dual-scfs').length = 0;
	}
}

/**
 * updates the scf-list and the dual-scf-list
 * (last modification: 8.8.16 Andreas)
 * 
 */
function updateLists(){
	updateScfList();	
	var id = document.getElementById('select-primal-scfs').value;
	if(id != ""){
		updateDualScfList(id);
	}
}

/**
 * cleans the wavelet Plot (last modification: 26.7.16 Simon)
 */
function cleanWaveletPlot() {
	valuesWav = [];
	plotInstance3.draw();
}

/**
 * fills a selectBox with the scaling functions in the new database (last
 * modification: 26.7.16 Simon)
 * 
 * @param {list}
 *            selectBox which should be filled
 * @param{array} dbEntries		the elements which will be put into the list
 */
function fillList(list, dbEntries) {
	// var dropDB = document.getElementById('select-primal-scfs');
	// delete all elements
	list.length = 0;
	// check if there is at least one element in the new database
	if (dbEntries[0] != undefined) {
		// add all elements to the list
		for (var j = 0; j < dbEntries[0].values.length; j++) {
			var option = document.createElement('option');
			// save the id of the scalingfunction as value of the option entry
			option.value = dbEntries[0].values[j][0];
			option.text = dbEntries[0].values[j][1];
			list.add(option);
		}
	}
}

/**
 * generates an string representing the information of a scalingfunction (given
 * by the database) and places it in the textfield on the html page (last
 * modification: 8.8.16 Simon)
 * 
 * @param{idOfScf} number id of the scalingfunction
 */
function showInformation(idOfScf) {
	if(idOfScf != ""){
		var scf = db.exec("SELECT * FROM scalingfunctionsSupp WHERE id=" + idOfScf)[0].values[0];
		// console.log(scf);
		var info = "  id: " + scf[0] + "\n  name: " + scf[1] + "\n  DOI: " + scf[2]
				+ "\n  reference: " + scf[3] + "\n  mask: " + scf[4]
				+ "\n  critical Sobolev exponent = " + scf[6]
				+ "\n  critical Hoelder exponent = " + scf[7]
				+ "\n  exactness of polynomial approxmation = " + scf[8]
				+ "\n  comment: " + scf[12];
	
		document.getElementById('textarea-scfs-info').value = info;
		
		//update the reference link
		var referenceLink = document.getElementById('link-reference');
		referenceLink.text = scf[3];
		referenceLink.href = "http://www.dx.doi.org/"+scf[2];
	}
	
}

/**
 * builds an functionPlot object without values! (last modification: 15.7.16
 * Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * @return{functionPlot} object instance of an functionPlot object
 */
function buildPlot(target) {
	try {

		var plotInst = functionPlot({
			target : target,
			data : [ {
				// uses the filter function from pointEvaluation.js
				points : [ [ 0 ], [ 0 ] ],
				fnType : 'points',
				graphType : 'polyline',
			} ]
		});

		// return the wavelet plot as object
		return plotInst;

	} catch (err) {
		console.log(err);
		alert(err);
	}
}

// this functions must be invoked by a FunctionPlot object
// the idea is to invoke it during a zoom (e.g. plotInstance.on("during:draw",
// zoomFilter) )
// so that not a few necessary points must be plotted
// zoomFilterScf refers to the values 'valuesScf' and zoomFilterDer refers to
// 'valuesDer'
function zoomFilterScf() {
	var xDomain = this.options.xDomain;
	var newPoints = filter(xDomain[0], xDomain[1], valuesScf, 1000);
	if (newPoints == undefined) {
		// console.log("No more detailled points available. Please zoom out.");
		alert("No more detailled points available. Please zoom out.");
	} else {
		this.options.data[0].points = newPoints;
	}
}
function zoomFilterDer() {
	var xDomain = this.options.xDomain;
	var newPoints = filter(xDomain[0], xDomain[1], valuesDer, 1000);
	if (newPoints == undefined) {
		// console.log("No more detailled points available. Please zoom out.");
		alert("No more detailled points available. Please zoom out.");
	} else {
		this.options.data[0].points = newPoints;
	}
}
function zoomFilterWav() {
	var xDomain = this.options.xDomain;
	var newPoints = filter(xDomain[0], xDomain[1], valuesWav, 1000);
	if (newPoints == undefined) {
		// console.log("No more detailled points available. Please zoom out.");
		alert("No more detailled points available. Please zoom out.");
	} else {
		this.options.data[0].points = newPoints;
	}
}

/**
 * returns the coefficients of the scalingfunction as an array of numbers which
 * were stored as one String in the database (last modification: 1.7.16 Simon)
 * 
 * @param{integer} idOfScf id of the scalingfunction
 * 
 * @return{array} [a, a_start] Array containing scalingfunction-coefficients and
 *                the start index a_start
 */
function getCoeffs(idOfScf) {
	var coeffsAsString = db.exec("SELECT mask FROM scalingfunctionsSupp "
			+ "WHERE id=" + idOfScf)[0].values[0][0];
	var a = stringToNoArray(coeffsAsString);
	a_start = db.exec("SELECT a_start FROM scalingfunctionsSupp " + "WHERE id="
			+ idOfScf)[0].values[0][0];
	return [ a, a_start ];
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

		var number = parseFloat(str.trim());
		array.push(number);
		// console.log(array);
		return array;
	} catch (err) {
		console.log(err.message);
	}
}