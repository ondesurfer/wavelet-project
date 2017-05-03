/**
 * builds an Plot object which consists of the plot, all available values.
 * The plot and the values are connected with an filter. So for a plot not 
 * all values are used.
 * (last modification: 02.05.17 Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * @param{double[][]} values - values which are hold in background of the resultObject
 * 								(We plot so many of them how are necessary to get a beautiful plot)
 * 
 * @return{object} bigPlot - instance of an bigPlot object
 */
function buildPlot(target,values) {
	try {
		var plotInst = functionPlot({
			target : target,
			data : [ {
				
				//needs computed points as [[x1,y1],[x2,y2],...] where x1<x2<...
				points : [ [ 0 ], [ 0 ] ],
				fnType : 'points',
				graphType : 'polyline',
				color: 'blue'
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
			var xDomain = this.options.xAxis.domain;
			var newPoints = filter(xDomain[0], xDomain[1],bigPlotObj.allValues, 1000);
			if (newPoints == undefined) {
				// console.log("No more detailled points available. Please zoom out.");
				alert("No more detailled points available. Please zoom out.");
			} else {
				this.options.data[0].points = newPoints;
			}
		} 
		bigPlotObj.plot.on("during:draw", zoomFilter);
		if(values!=undefined){
			bigPlotObj.drawValues(values);
		}
   		
  		/*var sliderId = target+'slider';	
  		$(target).append('<div><input type="range" id="testID" name="mytext[]" />');
  		
		$('#testID').change(function(){
			bigPlotObj.plot.options.xAxis.domain = [-8, 24];
			bigPlotObj.plot.meta.xDomain=[-8,24];
			console.log(bigPlotObj.plot.options.xAxis.domain);
			//bigPlotObj.plot=functionPlot(bigPlotObj.plot.options); //wird so ein neues plot objekt erstellt?
			// das alte bigPlotObj ist dann nicht mehr dargestellt?
			//eig . besser: bigPlotObj.plot.draw() - funktioniert aber nicht, weil die Achsen anders benutzt werden.
			//bigPlotObj.plot.draw();
			bigPlotObj.plot.buildContent();
			console.log(bigPlotObj);
		});*/
				
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
		
	return newValues;
}
