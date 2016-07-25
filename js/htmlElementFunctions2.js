/**
 * this file contains the method to add the functions to some html elements on the main page
 */

function setHtmlFunctions() {

	//updates the drop-down-list if any condition is changed
	document.getElementById('select1').onchange = updatePrimalScalingFunctionList;
	document.getElementById('select2').onchange = updatePrimalScalingFunctionList;
	document.getElementById('input1').onchange = updatePrimalScalingFunctionList;
	document.getElementById('input2').onchange = updatePrimalScalingFunctionList;
	document.getElementById('input3').onchange = updatePrimalScalingFunctionList;
	document.getElementById('input4').onchange = updatePrimalScalingFunctionList;

	//cleans the info field and the function plot if the choosen scalingfunction is changed
	document.getElementById('primalScalingFunctions').onchange = function() {
		cleanPlotAndInfo();

	};

	//adds the showInformation function to the showInformation button 
	document.getElementById('input5').onclick = function() {
		showInformation(document.getElementById('primalScalingFunctions').value);

	};

	//following is added to the plot button: calculate
	document.getElementById('input6').onclick = function(event) {
		event.preventDefault();
		//Fehlerabfrage nötig!!
		var c_t = getCoeffs(document.getElementById('primalScalingFunctions').value);
		var c = c_t[0];
		var c_start = c_t[1];
		console.log("c", c);
		console.log("c_start", c_start);
		var N_0 = 10;
		var mu = 0;
		//calculates the new scaling-function values and saves it globally
		valuesScf = iterativePointEvaluation2(c, c_start, N_0, mu);
		//updates the data of the plotInstance1 object
		plotInstance1.draw();

	};
}
/** resets the string in the textArea and sets the points of the plots to [[0],[0]]
 *  (last modification: 15.7.16 Simon)
 */
function cleanPlotAndInfo() {
	document.getElementById('textarea1').value = "";
	valuesScf = [ [ 0 ], [ 0 ] ];
	valuesDer = [ [ 0 ], [ 0 ] ];
	plotInstance1.draw();
	plotInstance2.draw();
}

/** updates the List containing the scalingfunctions complying the conditions given in the html elements
 *  (last modification: 25.7.16 Andreas)
 */
function updatePrimalScalingFunctionList() {
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

	var str = genSQLFilter(cond);
	var newstr = "SELECT * FROM ScalingFunctionsSupp WHERE " + str;
	var currentdb = db.exec(newstr);

	//console.log(currentdb);	
	//console.log(currentdb[0].values[zeile]);
	fillPrimalScalingFunctionList(currentdb);
}

/** fills the List ('primalScalingFunctions') with the scalingfunctions in the new database
 *  (last modification: 25.7.16 Andreas)
 * 
 * @param{database} database with the elements which will be put into the list
 */
function fillPrimalScalingFunctionList(database) {
	var primalSFList = document.getElementById('primalScalingFunctions');
	//delete all elements
	primalSFList.length = 0;
	//check if there is at leas one element in the new database
	if (database[0] != undefined) {
		//add all elements to the list
		for (var j = 0; j < database[0].values.length; j++) {
			var option = document.createElement('option');
			//save the id of the scalingfunction as value of the option entry
			option.value = database[0].values[j][0];
			option.text = database[0].values[j][1];
			primalSFList.add(option);
		}
	}
}

/** Generates an string representing the information of a scaling function
 *  (given by the database) and places it in the textfield on the html page
 *  (last modification: 25.7.16 Andreas)
 * 
 * 	@param{int}	ID		the ID of the scaling function.
 */
function showInformation(ID) {
	var scf = db.exec("SELECT * FROM ScalingFunctionsSupp WHERE id=" + ID)[0].values[0];
	
	
	console.log(scf);
	var info = "  id: " + ID + "\n  name: " + scf[1] + "\n  DOI: " + scf[2]
			+ "\n  reference: " + scf[3] + "\n  mask: " + scf[4]
			+ "\n  critical Sobolev exponent = " + scf[6]
			+ "\n  critical Hoelder exponent = " + scf[7]
			+ "\n  exactness of polynomial approxmation = " + scf[8]
			+ "\n  comment: " + scf[12];

	document.getElementById('textarea1').value = info;
}

/** builds an functionPlot object without values!
 *  (last modification: 15.7.16 Simon)
 * 	@param{String} target name of the html-area where the plot object should appear
 * 	@return{functionPlot} object  instance of an functionPlot object
 */
function buildPlot(target) {
	try {

		var plotInst = functionPlot({
			target : target,
			data : [ {
				//uses the filter function from pointEvaluation.js
				points : [ [ 0 ], [ 0 ] ],
				fnType : 'points',
				graphType : 'polyline',
			} ]
		});

		//return the wavelet plot as object
		return plotInst;

	} catch (err) {
		console.log(err);
		alert(err);
	}
}

//	this functions must be invoked by a FunctionPlot object	
// 	the idea is to invoke it during a zoom (e.g. plotInstance.on("during:draw", zoomFilter) )
//	so that not a few necessary points must be plotted
// zoomFilterScf refers to the values 'valuesScf' and zoomFilterDer refers to 'valuesDer'
function zoomFilterScf() {
	var xDomain = this.options.xDomain;
	var newPoints = filter(xDomain[0], xDomain[1], valuesScf, 700);
	if (newPoints == undefined) {
		console.log("No more detailled points available. Please zoom out.");
		//alert("No more detailled points available. Please zoom out.");
	} else {
		this.options.data[0].points = newPoints;
		//console.log("newPoints",newPoints);
	}
}
function zoomFilterDer() {
	var xDomain = this.options.xDomain;
	var newPoints = filter(xDomain[0], xDomain[1], valuesDer, 700);
	if (newPoints == undefined) {
		console.log("No more detailled points available. Please zoom out.");
		//alert("No more detailled points available. Please zoom out.");
	} else {
		this.options.data[0].points = newPoints;
		//console.log("newPoints",newPoints);
	}
}

/** returns the coefficients of the scalingfunction as an array of numbers 
 * which were stored as one String in the database
 *  (last modification: 1.7.16 Simon)
 * 
 *	@param{integer} idOfScf 	id of the scalingfunction
 * 
 * 	@return{array} [a, a_start]  Array containing scalingfunction-coefficients
 and the start index a_start
 */
function getCoeffs(idOfScf) {
	var coeffsAsString = db.exec("SELECT mask FROM ScalingFunctionsSupp "
			+ "WHERE id=" + idOfScf)[0].values[0][0];
	var a = stringToNoArray(coeffsAsString);
	a_start = db.exec("SELECT a_start FROM ScalingFunctionsSupp " + "WHERE id="
			+ idOfScf)[0].values[0][0];
	return [ a, a_start ];
}

/** converts a String of the form "1, 2, 3; 4" to an array as [1;2;3;4].
 * 	warning: there is no test if the input is right. The input format must be "1.23, 4.56; ... ; 7.89"
 *  (last modification: 15.7.16 Simon)
 * 
 *	@param{String} coeffsAsString  	String only containing numbers an "," or ";"
 * 
 * 	@return{array} array  Array containing the numbers
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
		console.log(array);
		return array;
	} catch (err) {
		console.log(err.message);
	}
}