/**
 * builds an Plot object which consists of the plot, all available values.
 * The plot and the values are connected with an filter. So for a plot not 
 * all values are used.
 * (last modification: 22.2.17 Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * @return{functionPlot} object instance of an plot object
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
		
		function bigPlot( plot1, allValues1 ) {
   			return { 
       			 	plot : plot1,
       			 	allValues : allValues1,
       			 	drawValues : function(values){this.allValues=values; this.plot.draw(); },
   			 }; 			
		};
				
		var bigPlotObj = new bigPlot(plotInst,[[0,0]]);
		
		function zoomFilter() {
			var xDomain = this.options.xDomain;
			var newPoints = filter(xDomain[0], xDomain[1],bigPlotObj.allValues, 1000);
			if (newPoints == undefined) {
				// console.log("No more detailled points available. Please zoom out.");
				alert("No more detailled points available. Please zoom out.");
			} else {
				this.options.data[0].points = newPoints;
			}
		} 
		console.log(bigPlotObj);	
		bigPlotObj.plot.on("during:draw", zoomFilter);
		return bigPlotObj;
			
	} catch (err) {
		console.log(err);
		alert(err);
	}
}

/** This method searches only a few nessecary values of a function in a
 *  equally spaced grid.  This makes the plot a lot faster.
 *
 *	(last modification: 25.7.16 Simon)
 *	@param{Array} 	allValues 		Input of all the values, which should be
 * 										filtered.
 * 	@param{float} 	leftXvalue 		left border of the function plot.
 *  @param{float}	rightXvalue		right border of the function plot.
 *  @param{int} 	wantedNumOfValues  wanted Number of values in the interval
 * 										leftXvalue..rightXvalue. (A gridwidth is calculated 
 * 										which complies that 'wantedNumOfValues' of values are choosen 
 * 										from the interval leftXvalue..rightXvalue. 
 * 										If 'allValues' does not contain the interval, less values than 
 * 										'wantedNumOfValues' are choosen, satisfying the calculated gridwidth. )
 *  
 * 	@return{Array} 	values  
 */

function filter(leftXvalue, rightXvalue, allValues, wantedNumOfValues){
	//if there is no value in the allValues-Array
	if(allValues.length==0){
		//console.log("kein Wert enthalten");
		return allValues;
	}	
	//console.log("test");
	//the smallest x-value contained in 'allValues'
	var funcXleft = allValues[0][0];
	var funcXright = allValues[allValues.length-1][0];
	
	//if there is no value in the window
	if(leftXvalue>funcXright||rightXvalue<funcXleft){
		return[];
	}
	
	//distance between x-values in allValues
	var gridDist=allValues[1][0]-allValues[0][0];
	
	//distance nessecary to get 'wantedNumOfValues' 
	var wishedDist=(rightXvalue-leftXvalue)/wantedNumOfValues;
	//step
	var step=wishedDist/gridDist;
	//console.log("step", step);
	if (step<0.4){
		console.log("Aufloesung zu niedrig");
		return undefined;
	}else{
		step=Math.floor(step);
	}		
	if(step==0){step=1;}	
	
	//Indices of first and last necessary x-Value from 'allValues'
	var startIndex;
	var endIndex;
	
	if(leftXvalue<=funcXleft){
		startIndex=0;
	}
	else{
		 startIndex=Math.floor((leftXvalue-funcXleft)/gridDist);
	}
	if(rightXvalue>=funcXright){
		endIndex=allValues.length-1;
	}
	else{
		endIndex=Math.ceil((rightXvalue-funcXleft)/gridDist);
	}
		
	/*Following should not happen:	
	//if the indices are out of border
	if(leftXindex<0){leftXindex=0;}
	if(rightXindex>=allValues.length){rightXindex=allValues.length-1;}
	*/
		
	//values in the allvalues array between right and left xValue
	var newNumOfValues= Math.ceil((endIndex-startIndex)/step)+1;			
	var newValues = createArray(newNumOfValues,2);
			
	var index = startIndex;
	
	for(var i=0;i<newValues.length-1;i++){
		newValues[i][0]=allValues[index][0];
		newValues[i][1]=allValues[index][1];
		index += step;
	}
	
	newValues[newValues.length-1][0]= allValues[endIndex][0];		
	newValues[newValues.length-1][1]= allValues[endIndex][1];
	
	//Ausgaben
	/*
	console.log("startIndex:", startIndex, "endIndex", endIndex, "step", step);
	console.log("neNumOfValues",newNumOfValues);
	console.log("allValues",allValues);
	console.log("neNumOfValues",newNumOfValues);
	console.log("newValues",newValues);
	*/
	
	return newValues;
}


//following code is outdated

/**
 * builds an functionPlot object without values! (last modification: 15.7.16
 * Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * @return{functionPlot} object instance of an functionPlot object
 */
/*function buildPlot(target) {
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
// zoomFilterScf refers to the !!!!STATIC!!!! values 'valuesScf' and zoomFilterDer refers to
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
}*/

