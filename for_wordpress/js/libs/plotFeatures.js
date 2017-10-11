/**dependecies: jQuery, functionPlot
 * 
 * Do not use any of the both methods for non-aequidistant grids!!!
 *
 * builds an Plot object which consists of the plot, all available values .
 * The plot and the values are connected with an filter. So for a plot not 
 * all values are used.
 * Without this trick the functionPlot-libary plots are too slow and not beautiful.
 * (last modification: 10.10.17 Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * 				TAKE CARE: The html-area is cleared bevor the plot starts. So information can get lost.
 * @param{double[][]} values - values which are hold in background of the resultObject
 * 								(We plot so many of them how are necessary to get a beautiful plot)
 * 
 * @return{object} bigPlot - instance of an bigPlot object
 */
function buildPlot(target,values,sobolevExp) {
	$(target).empty();
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
		// The 'bigPlot-object' contains a plot object, many values and a fuction to draw them
		function bigPlot( plot1, allValues1 ) {
   			return { 
       			 	plot : plot1,
       			 	allValues : allValues1,
       			 	drawValues : function(values){this.allValues=values; this.plot.draw(); },
   			 }; 			
		};
		
		//build a bigPlot-object with the plot-Instance from before		
		var bigPlotObj = new bigPlot(plotInst,[[0,0]]);
		
		/**
		 *This function gets the current domain of the plot-instance, 
		 * gets as many points as needed for a nice graphic in this domain,
		 * and updates the points of the plot-instance 
		 */
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
		//add the zoomFilter function to the bigPlot object.
		bigPlotObj.plot.on("during:draw", zoomFilter);
		
		//adding a message-div for warnings etc. like function is not continous etc.
		var msg=document.createElement( "div" );
		$(target).prepend(msg);
		
		if(values!=undefined){
			//numeric check of continuity:
			//var val = checkContinuity(values,1000);
			
			//better: check of continuity by sobolev exponent
			var val = checkContinuity2(sobolevExp);
			if(val==0){
				$(msg).empty();
				$(msg).css({'color':'red'}); 
				$(msg).text('Caution: Function is discontinuous!');
			}
			else if(val==0.5){		
				$(msg).empty();
				$(msg).css({'color':'red'}); 
				$(msg).text('Caution: Function may be discontinuous!');
			}
			else{
				$(msg).empty();
			}
			bigPlotObj.drawValues(values);
		}
   	
		return bigPlotObj;
			
	} catch (err) {
		console.log(err);
		alert(err);
	}
}

//Same function as above - just with additional sliders to plot the different primbs functions
/**
 * builds an Plot object which consists of the plot, all available values, and some additional sliders.
 * The plot and the values are connected with an filter. So for a plot not 
 * all values are used.
 * (last modification: 02.05.17 Simon)
 * 
 * @param{string} target name of the html-area where the plot object should
 *                appear
 * @param{function} calcValFunc - function which calculates the values which shall be plotted
 * @param{obj[]} params - additional parameter to function calcValFunc
 * @param{double[]} slider1Range - Range of slider 1
 * @param{double[]} slider2RangeFunct - Function which calculates range of slider 2 (depends on slider1)
 * @params{obj[]} params2 - additional parameters to function slider2RangeFunct
 * @params{double} sobolevExp - sobolev exponent of the current function. Is used to check continuaty.
 * 
 * @return{object} bigPlot - instance of an bigPlot object
 */
function buildPlot2(target,calcValFunc,params,slider1Range,slider2RangeFunct,params2,sobolevExp) {
	$(target).empty();
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
		// The 'bigPlot-object' contains a plot object, many values and a fuction to draw them
		function bigPlot( plot1, allValues1 ) {
   			return { 
       			 	plot : plot1,
       			 	allValues : allValues1,
       			 	drawValues : function(values){this.allValues=values; this.plot.draw(); },
   			 }; 			
		};
				
		var bigPlotObj = new bigPlot(plotInst,[[0,0]]);
		
		//build a zoomFilter-function 
		function zoomFilter2() {
			var xDomain = this.options.xAxis.domain;
			var newPoints = filter(xDomain[0], xDomain[1],bigPlotObj.allValues, 1000);
			if (newPoints == undefined) {
				// console.log("No more detailled points available. Please zoom out.");
				alert("No more detailled points available. Please zoom out.");
			} else {
				this.options.data[0].points = newPoints;
			}
		} 
		//adds zoomFilter to plot
		bigPlotObj.plot.on("during:draw", zoomFilter2);
		
		//adding a message-div for warnings etc. like function is not continous etc.
		var msg=document.createElement( "div" );
		$(target).prepend(msg);
		
		//adding slider to change scale of y-axis of function plot:
		var scale = document.createElement("input");
		//var deg = 90;
		//scale.style.webkitTransform = 'rotate('+deg+'deg)';
		//scale.style.mozTransform    = 'rotate('+deg+'deg)'; 
    	//scale.style.msTransform     = 'rotate('+deg+'deg)'; 
  		//scale.style.oTransform      = 'rotate('+deg+'deg)'; 
 	   	//scale.style.transform       = 'rotate('+deg+'deg)';
 	   	//console.log(bigPlotObj);
		
		scale.type = "range";
		scale.min = "0.1";
		scale.max = "1.9";
		scale.step = "0.1";
		
		var divScale = document.createElement("div");
		$(divScale).append(scale);
		$(target).append(divScale);
		
		$(scale).change(function(){			
			var xDist=bigPlotObj.plot.options.xAxis.domain[1]-bigPlotObj.plot.options.xAxis.domain[0];
			var factor = parseFloat($(scale).val());
			/*the slider range is from 0.1 to 2; 0.1 will bring a stretch of factor 10, but 2 just a 
			compression of factor 2. So, if factor is higher than 1 we multiply it by 5.*/
			if(factor>1){factor=((factor-1)+0.1)*10;}
			//console.log(factor);
			var newYdomain = bigPlotObj.plot.options.yAxis.domain;
			
			//old middle of y-Axis will stay middle of y-Axis
			var middle = (newYdomain[1]+newYdomain[0])/2;	
			
			//calculating nex y-axis-domain
			newYdomain[0]= middle - factor*xDist/2;
			newYdomain[1]= middle + factor*xDist/2;			
		
			bigPlotObj.plot.options.yAxis.domain = newYdomain ;
			//building a new plot-content with the options e.g.values from before
			bigPlotObj.plot=functionPlot(bigPlotObj.plot.options); 
			bigPlotObj.plot.buildContent();
		});
   		
   		var divSliders = document.createElement("div");
		
		//builds sliders and small textfields next to the function-plot:
		var slider1 = document.createElement("input");
		slider1.type = "range";
		//input.className = "css-class-name"; // set the CSS class
		$(divSliders).append(slider1); // put it into the DOM
		
		$(divSliders).append("level j=");
		
		var slider1Text = document.createElement("input");
		slider1Text.type = "text";
		slider1Text.style.width = "35px";
		$(divSliders).append(slider1Text); // put it into the DOM
		
		var slider2 = document.createElement("input");
		slider2.type = "range";
		$(divSliders).append(slider2); // put it into the DOM
		
		$(divSliders).append("k=");
		
		var slider2Text = document.createElement("input");
		slider2Text.type = "text";
		slider2Text.style.width = "35px";
		$(divSliders).append(slider2Text); // put it into the DOM
		
		$(target).append(divSliders);
		
		//setting the slider-range of slider1 (the range of slider2 will be calculated in dependecy of slider1 and more parameters.)
		$(slider1).prop({
			'min': slider1Range[0],
            'max': slider1Range[1],
        });
               
		//connects sliders with text-fields, so that they update each-other
		$(slider1).change(function(){
			$(slider1Text).val($(slider1).val());
			changeRangeSlider2();
			newValues();
		});
		$(slider1Text).change(function(){
			var value = parseInt($(slider1Text).val());
			//tests if the users input value is valid
			if(Number.isInteger(value) && value>=slider1Range[0] && value<=slider1Range[1]){
				$(slider1).val(value);
				changeRangeSlider2();
				newValues();
			}else{
				$(slider1Text).val($(slider1).val());
			}	
		});
		$(slider2).change(function(){
			$(slider2Text).val($(slider2).val());
			newValues();
		});
		$(slider2Text).change(function(){
			var value = parseInt($(slider2Text).val());
			var slider2Range = [parseInt($(slider2)[0].min),parseInt($(slider2)[0].max)];
			//tests if the users input value is valid
			if(Number.isInteger(value) && value>=slider2Range[0] && value<=slider2Range[1]){
				$(slider2Text).val(value);
				$(slider2).val($(slider2Text).val());
				newValues();
			}else{
				$(slider2Text).val($(slider2).val());
			}
		});
		
		
		//sets start-values for slider1, updates corresponding text-field, calculates range of slider2 and new values
		$(slider1).val(slider1Range[0]);
		$(slider1Text).val(slider1Range[0]);
		changeRangeSlider2();
		newValues();
		
		//calculates new values of the wavelet to plot.
		//For the delitation,translatation the values from the slider1 and slider2 are used
		//The other parameters and the function (calcValFunc) is given by the head of this function.
		function newValues(){
			var j=parseInt($(slider1).val());
			var k=parseInt($(slider2).val());
			var values = calcValFunc([j,k],params);
			//var val=checkContinuity(values,1000*Math.pow(2,j-1))){
			var val = checkContinuity2(sobolevExp);
			if(val==0){
				$(msg).empty();
				$(msg).css({'color':'red'}); 
				$(msg).text('Caution: Function is discontinuous!');
			}
			else if(val==0.5){		
				$(msg).empty();
				$(msg).css({'color':'red'}); 
				$(msg).text('Caution: Function may be discontinuous!');
			}
			else{
				$(msg).empty();
			}
			bigPlotObj.drawValues(values);
		}
		
		//is invoked when slider1 changes - then the range of slider2 must be changed too!
		function changeRangeSlider2(){
			var slider2Range = slider2RangeFunct($(slider1).val(),params2);
			$(slider2).prop({
				'min': slider2Range[0],
           		'max': slider2Range[1],
        	});
        	$(slider2Text).val($(slider2).val());
		}			
		return bigPlotObj;
			
	} catch (err) {
		console.log(err);
		alert(err);
	}
}
/** This method checks if the grade between two points is bigger than tol
 *	we use it to check, if the plot is realistic - if possible use new method 
 * 	'checkContinuity2'!
 *  @param{Array} values - values which will be checked
 * 	@param{int} tol  - maximal tolerated grade
 */
//use checkContinuity2 if possible!
function checkContinuity(values,tol){
	//console.log(values);
	if(values.length>1){
		var dx = values[1][0]-values[0][0];
		//console.log('dx',dx);
		var dxTol = dx * tol;
		for(var j=0; j<values.length-1; j++){
			if(Math.abs(values[j][1]-values[j+1][1])> dxTol){
				console.log('Function seems to be not continous!');
				return 0;
			}
		}
	}
	return 1;	
}

/** This method checks continuaty on base of the given sobolev exponent
 *  @param{Array} str - string of sobolev exponent
 *  (can be: number (sobolev exponent), null (unknown exponent), string (like '>0.5'), 'x' (not continous) )
 *  														
 * 	@return{int}  - 0 discontinous, 0.5 unknown, 1 continous
 */
function checkContinuity2(str){
	if (str==null||(typeof(str)=='string'&&str=='null')){
		return 0.5;
	}
	if(typeof(str)=='number'){
		if(str>0.5){
			return 1;
		}
		else{
			return 0.5;
		}
	}
	if(typeof(str)=='string'){
		if(str=='x'){
			return 0;
		}
		if(str.startsWith('>')){
			str=str.slice(1,str.length);
			if(!isNaN(parseFloat(str))){
				str=parseFloat(str);
				str=str+0.001;
			}
		}
		//check if is number
		if(!isNaN(parseFloat(str))){
			str=parseFloat(str);
			if(str>0.5){
				return 1;
			}
			else{
				return 0.5;
			}
		}
	}
	else{
		return undefined;
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
		console.log("Too less points to use the filter method!");
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