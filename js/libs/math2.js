/** This file contains further functions for mathematical purposes
 *
 *	Dependencies: matrixOperations.js
 *
 *	(last modification: 17.8.16 Andreas)
 */

/**
 * Get the length of a number.
 * (last modification: 17.8.16 Andreas)
 * 
 * @param{int}	number.
 * 
 * @return{int}	the number length.
 */
function getNumberlength(number) {
    return number.toString().length;
}

/** Compute n choose k.
 *  (last modification: 13.5.16 Andreas)
 * 
 *   @param{int} n.
 *   @param{int} k.
 * 
 *   @return{int} n choose k.
 */
function nchoosek(n,k){
	if (k + k > n) { k = n - k; }
    if (k < 0) {
    	console.log("k < 0"); 
    	return 0;
    }
    else {
      var result = 1;
      for (i = 0; i < k; i++) {
        result = (result * (n-i)) / (i + 1);
      }
      return result;
    }
}

/** Computes the factorial of an integer.
 *  (last modification 3.5.16 Andreas)
 * 
 *   @param{int} n.
 * 
 *   @return{int} result n!.
 */
function factorial(n) {
	if(n==0){return 1;}
	var result = n;
	for(var i = n - 1; i > 1; i--) {
		result = result * i;
	}
	return result;
}

/** Add the coefficients of two polynomials.
 *  (last modification 13.5.16 Andreas)
 * 
 *   @param{Array} p1 coefficients of the first polynomial.
 *   @param{Array} p2 coefficients of the second polynomial.
 * 
 *   @return{Array} the coeffs of the sum of the two polynomials.
 */
function polyAdd1(p1,p2){
	if(p1.length<p2.length){
		var p3 = zerosVec(p2.length - p1.length).concat(p1);
		return numeric.add(p2, p3);
	}else{
		var p3 = zerosVec(p1.length - p2.length).concat(p2);
		return numeric.add(p1, p3);
	}
}

/** Add the coefficients of two polynomials.
 *  (last modification 13.5.16 Andreas)
 * 
 *   @param{Array} p1 coefficients of the first polynomial.
 *   @param{Array} p2 coefficients of the second polynomial.
 * 
 *   @return{Array} the coeffs of the sum of the two polynomials.
 */
function polyAdd2(p1,p2){
	var pShort;
	var pLong;
	if(p1.length>p2.length){
		pLong=p1;
		pShort=p2;
	}
	else{
		pLong=p2;
		pShort=p1;
	}
	
	var sum = new Array(pLong.length);
	var diff = pLong.length-pShort.length;
	for(var i=0;i<diff;i++){
		sum[i]=pLong[i];	
	}
	for(var i=diff;i<sum.length;i++){
		sum[i]=pLong[i]+pShort[i-diff];
	}
	return sum;
}

/**
 * Convert the coefficients of a polynomial to a string-representation.
 * (last modification 21.9.16 Andreas)
 * 
 *	 @param{Array} coefficients.
 *  
 * 	 @return{String} stringRepresentation.
 */
function coeffsToStringRepresentation(coeffs){
	stringRepresentation = coeffs[0].toString();
	if(coeffs.length > 1){
		stringRepresentation += '+'+coeffs[1].toString()+'*x';
	}
	for(var i = 2; i < coeffs.length; i++){
		stringRepresentation += '+'+coeffs[i].toString()+'*x^'+i.toString();
	}
	return stringRepresentation;
}

/**
 *  Get the coefficients of the coefficients of the mth derivative
 *  of a polynomial with degree n.
 *  (last modification 23.9.16 Andreas)
 *  
 *    @param{Integer} n		degree of the polynomial.
 *    @param{Integer} m		derivative-order ( m <= n+1).
 *    
 *    @param{Array}	  a		coefficients.
 */
function getPolyDerivativeCoefficients(n,m){
	var a = [];
	
	for(var i = 0; i < m; i++){
		a[i] = 0;
	}
	
	for(var i = m; i < n + 1; i++){
		var b = i;
		for(var j = 1; j < m; j++){
			b *= i - j;
		}
		a[i] = b;
	}
	return a;
}

/**
 *  Compute the spline coefficients of a cubic spline from given control
 *  points. It is assumed that there are four control points per interval
 *  (counted with multiplicity for C^0-, C^1- or C^2-transitions between
 *  the polynomials).
 *  (last modification 23.9.16 Andreas)
 *  
 *  @param{Array} controlPointsX	array with the x-coordinates of the points.
 *  @param{Array} controlPointsY	array with the y-coordinates of the points.
 *  
 *  @return{Array} coefficients.
 */
function computeCubicSplineCoeffs(controlPointsX, controlPointsY){
	if(controlPointsX.length != controlPointsY.length){
		console.error("Dimensions of controlPointsX and controlPointsY" +
				" mismatch.");
	}
	
	var n = controlPointsX.length;
	numberOfIntervals = n/4;

	if(!(Number.isInteger(numberOfIntervals))){
		console.log(numberOfIntervals);
		console.error("The number of points ist not a multiple of 4.");
	}
	
	var M = zeros(n);
	var b = new Array(n);
	for(var i = 0; i < numberOfIntervals; i++){
		
		// array to save the x-coordinates of the control points for the
		// current interval
		var controlPointsX_i = new Array(4);
		controlPointsX_i[0] = controlPointsX[4*i];
		
		b[4*i] = controlPointsY[4*i];
		
		var multipleKnots = 0;
		// count the multiplicity of the knot at the end of the interval
		for(var j = 1; j < 4; j ++){
			controlPointsX_i[j] = controlPointsX[4*i + j];
			b[4*i + j] = controlPointsY[4*i + j];
			
			if(controlPointsX[4*i + 3] == controlPointsX_i[j]){
				multipleKnots++;
			}
		}
		
		var M_i = vander(controlPointsX_i);
		
		setBlockMatrix(M, M_i, 4*i, 4*i);
		
		var derivativeCoeffs = [];
		
		// modify the matrix in the case of multiple knots
		// begin with j = 2, because C^0-regularity amounts no matrix-change
		var coeff_pot = 0;
		for(var j = 2; j < multipleKnots + 1; j++){
			derivativeCoeffs = getPolyDerivativeCoefficients(3, j - 1);
			for(var k = 0; k < 4; k++){
				/*console.log("derivativeCoeffs", derivativeCoeffs[k]);
				console.log("(controlPointsX[4*i + k])",
						Math.pow(controlPointsX[4*i + k], k - j + 1));*/
				coeff_pot = Math.pow(controlPointsX[4*i + k], k - j + 1);
				if(coeff_pot == Infinity){
					coeff_pot = 0;
				}
				//console.log("coeff_pot", coeff_pot);
				M[4*i + 4 - j][4*i + k] = derivativeCoeffs[k] * coeff_pot;
				M[4*i + 4 - j][4*i + k + 4] = -(derivativeCoeffs[k]) * coeff_pot;
			}
			b[4*i + 4 - j] = 0;
		}
	}
	//printMatrix(M);
	//console.log("b", b);
	
	var a = gaus2(M, b);
	
	return a;
}

/**
 *  Compute a polynomial via Horner-scheme.
 *  (last modification 29.9.16 Andreas)
 *  
 *  @param{Array}	coeffs		coefficients of the polynomial
 *  							(coeffs[0] + coeffs[1]*x + ...). 
 *  @param{Float}	x			the point to evaluate.
 *  
 *  @return{Float}	y			the value of the evaluation.
 *  
 */
function horner(coeffs, x){
	var y = coeffs[coeffs.length - 1];
	for(var i = coeffs.length - 1; i > 0; i--){
		y = x*y + coeffs[i - 1];
	}
	return y;
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