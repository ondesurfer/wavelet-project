/**
 * this file contains the method to add the functions to some html elements on
 * the Fwavelet-plot.html file
 */

function setHtmlFunctions() {

	// updates the List if any condition is changed
	document.getElementById('select1').onchange = updateScfList;
	document.getElementById('select2').onchange = updateScfList;
	document.getElementById('input1').onchange = updateScfList;
	document.getElementById('input2').onchange = updateScfList;
	document.getElementById('input3').onchange = updateScfList;
	document.getElementById('input4').onchange = updateScfList;

	// cleans the info field and the function plot if the choosen
	// scalingfunction is changed
	document.getElementById('primalScalingFunctions').onchange = function() {
		cleanPlotAndInfo();
		updateDualScfList(this.value);

	};

	// adds the showInformation function to the showInformation button
	document.getElementById('input5').onclick = function() {
		showInformation(document.getElementById('primalScalingFunctions').value);

	};

	// following is added to the scf-plot button:
	document.getElementById('input6').onclick = function() {
		// Fehlerabfrage noetig!!
		var c_t = getCoeffs(document.getElementById('primalScalingFunctions').value);
		// calculates the new derivative values and saves it globally
		valuesScf = iterativePointEvaluation2(c_t[0], c_t[1], 14, 0);
		// updates the data of the plotInstance2 object
		plotInstance1.draw();

	};

	// following is added to the wav-plot button:
	document.getElementById('input8').onclick = function() {
		// Fehlerabfrage noetig!!
		var c_t = getCoeffs(document.getElementById('primalScalingFunctions').value);
		var d_t = getCoeffs(document.getElementById('dualScalingFunctions').value);
		// calculates the new derivative values and saves it globally
		valuesWav = waveletPointEvaluation(c_t[0], c_t[1], d_t[0], d_t[1], 13);

		// updates the data of the plotInstance3 object
		plotInstance3.draw();

	};

	// displays/hides the plot2Area when the checkBox is changed
	document.getElementById('check1').onchange = function() {
		if (document.getElementById('check1').checked) {
			document.getElementById('plot2Area').style.display = 'block';
		} else {
			document.getElementById('plot2Area').style.display = 'none';
		}
	};

	// calculates the derivation points and plots them, if the derivation order
	// input-textfield is changed
	document.getElementById('input7').onchange = function() {
		// Fehlerabfrage noetig!!
		var c_t = getCoeffs(document.getElementById('primalScalingFunctions').value);
		// calculates the new derivative values and saves it globally
		valuesDer = iterativePointEvaluation2(c_t[0], c_t[1], 14,
				parseInt(document.getElementById('input7').value));
		// updates the data of the plotInstance2 object
		plotInstance2.draw();
	};
}
/**
 * resets the string in the textArea and sets the points of the plots to []
 * (last modification: 15.7.16 Simon)
 */
function cleanPlotAndInfo() {
	document.getElementById('textarea1').value = "";
	document.getElementById('input7').value = "";
	valuesScf = [];
	valuesDer = [];
	plotInstance1.draw();
	plotInstance2.draw();
	cleanWaveletPlot();
	document.getElementById('dualScalingFunctions').length = 0;
}

/**
 * updates the List containing the scaling functions complying the conditions
 * given in the html elements (last modification: 1.7.16 Simon)
 */
function updateScfList() {
	cleanPlotAndInfo();
	var cond = new Array();
	cond[0] = [ document.getElementById('select1').name,
			document.getElementById('select1').value ];
	cond[1] = [ document.getElementById('select2').name,
			document.getElementById('select2').value ];
	cond[2] = [ document.getElementById('input1').name,
			document.getElementById('input1').value ];
	cond[3] = [ document.getElementById('input2').name,
			document.getElementById('input2').value ];
	cond[4] = [ document.getElementById('input3').name,
			document.getElementById('input3').value ];
	cond[5] = [ document.getElementById('input4').name,
			document.getElementById('input4').value ];
	var str = generateSQLCommand(cond);
	var newstr = "SELECT * FROM scalingfunctionsSupp" + str;
	var currentdb = db.exec(newstr);
	// console.log(currentdb);
	// console.log(currentdb[0].values[zeile]);
	fillList(document.getElementById('primalScalingFunctions'), currentdb);
}
/**
 * updates the List containing the dual scaling functions fitting to the choosen
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
		fillList(document.getElementById('dualScalingFunctions'), currentdb);
	}
	// if no dual-scf is found, the list is set empty
	else {
		console.log("no dual scalingfunction in database");
		document.getElementById('dualScalingFunctions').length = 0;
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
 * generates an SQL command for the search of the database complying the
 * condition given in the 'cond' Array (last modification: 1.7.16 Simon)
 * 
 * @param{cond} array conditions which should be complied
 */
function generateSQLCommand(cond) {
	str = " WHERE ";
	for (var i = 0; i < cond.length; i++) {
		// (-2) means, that this condition should not be included in the search
		if (cond[i][1] != -2) {
			str = str + cond[i][0] + " " + cond[i][1] + " AND ";
		}

	}
	// cut of the last 'AND':
	str = str.slice(0, str.length - 5);
	str = str + ";";
	return str;
}

/**
 * fills a selectBox with the scaling functions in the new database (last
 * modification: 26.7.16 Simon)
 * 
 * @param {list}
 *            selectBox which should be filled
 * @param{database} database with the elements which will be put into the list
 */
function fillList(list, database) {
	// var dropDB = document.getElementById('primalScalingFunctions');
	// delete all elements
	list.length = 0;
	// check if there is at leas one element in the new database
	if (database[0] != undefined) {
		// add all elements to the list
		for (var j = 0; j < database[0].values.length; j++) {
			var option = document.createElement('option');
			// save the id of the scalingfunction as value of the option entry
			option.value = database[0].values[j][0];
			option.text = database[0].values[j][1];
			list.add(option);
		}
	}
}

/**
 * generates an string representing the information of a scalingfunction (given
 * by the database) and places it in the textfield on the html page (last
 * modification: 15.7.16 Simon)
 * 
 * @param{idOfScf} number id of the scalingfunction
 */
function showInformation(idOfScf) {
	var scf = db.exec("SELECT * FROM scalingfunctionsSupp WHERE id=" + idOfScf)[0].values[0];
	// console.log(scf);
	var info = "  id: " + scf[0] + "\n  name: " + scf[1] + "\n  DOI: " + scf[2]
			+ "\n  reference: " + scf[3] + "\n  mask: " + scf[4]
			+ "\n  critical Sobolev exponent = " + scf[6]
			+ "\n  critical Hoelder exponent = " + scf[7]
			+ "\n  exactness of polynomial approxmation = " + scf[8]
			+ "\n  comment: " + scf[12];

	document.getElementById('textarea1').value = info;
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