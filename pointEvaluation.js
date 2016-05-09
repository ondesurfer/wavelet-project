/** This file contains functions for point evaluations of wavelets with given
 *  refinement coefficients and step size of the x-lattice
 *
 *	(last modification: 27.4.16 Andreas)
 */

//Attention: calculateIntegerPointValues doesn't return the right last value
//which should be zero.

/** Evaluate recursively the wavelet at points where it is not vanishing.
 * (Attention: inefficient!)
 *
 *	(last modification: 22.3.16 Simon)
 *	@param{Array} 	a 		the refinement coefficients.
 * 	@param{int} 	N 		1/2^N is the step size of the x-lattice.
 *
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							wavelet-values at these points in the form [x,y].
 */
function naiveRecursivePointEvaluation(c, N) {
	var solu = calculateIntegerPointValues(c);
	
	var a = new Array(c.length);
	for(var i=0; i<c.length; i++){
		a[i]=Math.pow(2,mu)*c[i];
	}
	

	var supportWidth = a.length - 1;
	var step = Math.pow(2, N);
	var values = createArray(step * supportWidth + 1, 2);

	function phi(j, l) {
		//cancel the fraction l/2^j until l becomes odd
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}

		//if the x-value lies on the left side of the compact support
		if (l < 0) {
			return 0;
		}//if the x-value lies on the right side of the compact support
		else if (Math.pow(2, -j) * l > a.length - 1) {
			return 0;
		}//if the x-value is an integer
		else if (j == 0) {
			return solu[l];
		}//recursive function call
		else {
			var sum = 0;
			for (var k = 0; k < a.length; k++) {
				sum += a[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			return sum;
		}
	}

	for (var i = 0; i < step * supportWidth + 1; i++) {
		values[i][0] = i * 1 / step;
		values[i][1] = phi(N, i);
	}

	return values;
}

/** Evaluate recursively the wavelet at points where it is not vanishing with
 *  memory of already computed values.
 *
 *	(last modification: 22.3.16 Simon)
 *	@param{Array} 	a 		the refinement coefficients.
 * 	@param{int} 	N 		1/2^N is the step size of the x-lattice.
 *
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							wavelet-values at these points in the form [x,y].
 */
//Achtung, funktioniert noch nicht richtig fuer Ableitungen- doch!
function recursivePointEvaluation(c, N, mu) {
	var solu = calculateIntegerPointValues(c, mu);
	var supportWidth = c.length - 1;
	var step = Math.pow(2, N);
	var values = createArray(step * supportWidth + 1, 2);
	
	var a = new Array(c.length);
	for(var i=0; i<c.length; i++){
		a[i]=Math.pow(2,mu)*c[i];
	}
	
	//fill in the known values at the integer points
	for (var i = 0; i < supportWidth + 1; i++) {
		values[i*step][0] = solu[i][0];
		values[i*step][1] = solu[i][1];
	}
	
	function phi(j, l) {
		//cancel the fraction l/2^j until l becomes odd
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}

		var x = Math.pow(2, -j) * l;
		//the actual x-value
		var index = step * x;
		//the index at which the x-value and the
		//corresponding y-value will be saved

		//if the x-value lies on the left side of the compact support
		if (x < 0) {
			return 0;
		}//if the x-value lies on the right side of the compact support
		else if (x > supportWidth) {
			return 0;
		}//if the y-value was already computed
		else if (values[index][0] != undefined) {
			return values[index][1];
		}//recursive function call
		else {
			var sum = 0;
			for (var k = 0; k < a.length; k++) {
				sum += a[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			values[index][0] = x;
			values[index][1] = sum;
			return sum;
		}
	}

	for (var i = 0; i < step * supportWidth + 1; i++) {
		phi(N, i);
	}

	return values;
}

/** Get the N for the step size 1/2^N for a fixed number M
 *  of equidistant x-lattice-points in the selected zoom-area
 *  [leftXValue, RightXValue]
 * 	
 * (last modification: 25.4.16 Andreas)
 * 	@param{int} 	M			number of equidistant x-lattice-points in the
 * 								plot-area.		
 * 	@param{real} 	leftXValue	left end of the plotting-/computing-area.
 *  @param{real}	RightXValue right end of the plotting-/computing-area.
 * 
 *  @return{int}	N			the exponent of the step size 1/2^N.
 */

function getN(leftXValue, rightXValue, M) {
	//step size
	var delta = (rightXValue - leftXValue) / M;

	//new N, step and values-array for the new j-level
	var N = Math.ceil(Math.log(1 / delta) / Math.LN2);
	return N;
}

/** Evaluate recursively the wavelet at points where it is not vanishing with
 *  memory of already computed values.
 *
 *	(last modification: 25.4.16 Andreas)
 *	@param{Array} 	a 			the refinement coefficients.
 *  @param{Array} 	valuesOld 	already computed values of the wavelet which
 * 								should be refined or coarsened
 * 								(adapt the size of the array!).
 * 	@param{real} 	leftXValue	left end of the plotting-/computing-area.
 *  @param{real}	RightXValue right end of the plotting-/computing-area.
 *  @param{int} 	N			the exponent of the step size 1/2^N.		
 *  
 * 	@return{Array} 	values  	the array of x-lattice-points and the
 * 								corresponding wavelet-values at these points
 * 								in the form [x,y].
 */
function recursivePointEvaluation2(a, leftXValue, rightXValue, valuesOld, N) {
	var supportWidth = a.length - 1;
	var stepNew = Math.pow(2, N);
	var valuesNew = createArray(stepNew * supportWidth + 1, 2);

	//compute the old N and the old step from valuesOld
	var stepOld = (valuesOld.length - 1) / supportWidth;

	console.log(Math.log2(stepOld));
	console.log(N);
	//in the case of refinement
	if (stepNew >= stepOld) {
		//copy all old values in the new array valuesNew
		var indexNew;
		for (var indexOld = 0; indexOld < valuesOld.length; indexOld++) {
			indexNew = stepNew * indexOld / stepOld;
			//should be an integer...
			valuesNew[indexNew][0] = valuesOld[indexOld][0];
			valuesNew[indexNew][1] = valuesOld[indexOld][1];
		}
	}//in the case of coarsening
	else {
		var indexOld;
		for (var indexNew = 0; indexNew < valuesNew.length; indexNew++) {
			indexOld = stepOld * indexNew / stepNew;
			//should be an integer...
			valuesNew[indexNew][0] = valuesOld[indexOld][0];
			valuesNew[indexNew][1] = valuesOld[indexOld][1];
		}
	}

	function phi(j, l) {
		//cancel the fraction l/2^j until l becomes odd
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}
		var x = Math.pow(2, -j) * l;
		//the actual x-value
		var index = stepNew * x;
		//the index at which the x-value and the
		//corresponding y-value will be saved

		//if the x-value lies on the left side of the compact support
		if (x < 0) {
			return 0;
		}//if the x-value lies on the right side of the compact support
		else if (x > supportWidth) {
			return 0;
		}//if the y-value was already computed
		else if (valuesNew[index][0] != undefined) {
			return valuesNew[index][1];
		}//recursive function call
		else {
			var sum = 0;
			for (var k = 0; k < a.length; k++) {
				sum += a[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			valuesNew[index][0] = x;
			valuesNew[index][1] = sum;
			return sum;
		}
	}

	//index from which the values of the (zoomed) plot are required
	//the task of the if-statement is to check whether one is in the
	//compact support or not
	var indexNewLinks = Math.floor(leftXValue * stepNew);
	if (indexNewLinks < 0) {
		indexNewLinks = 0;
	}

	var indexNewRechts = Math.ceil(rightXValue * stepNew);
	if (indexNewRechts >= valuesNew.length) {
		indexNewRechts = valuesNew.length - 1;
	}

	//computation of needed y-values
	for (var i = indexNewLinks; i <= indexNewRechts; i++) {
		if (valuesNew[i][1] == undefined) {
			phi(N, i);
		}
	}

	//trim the values to the nessecary ones
	//!changed: indexNewRechts+1 because the slice Method cuts one index before
	var valuesNecessary = valuesNew.slice(indexNewLinks, indexNewRechts+1);

	//return of the new values (usually a lot of entries are undefined),
	//and the necessary values
	var result = [valuesNew, valuesNecessary];
	return result;
}

/** Evaluate iteratively the wavelet at points where it does not vanish.
 *
 *	(last modification: 12.4.16 Andreas)
 *	@param{Array} 	a 		the refinement coefficients.
 * 	@param{int} 	N 		1/2^N is the step size of the x-lattice.
 * 
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							wavelet-values at these points in the form [x,y].
 */

function iterativePointEvaluation(c, N, mu) {
	var sol = calculateIntegerPointValues(c,mu);
	
	var a = new Array(c.length);
	for(var i=0; i<c.length; i++){
		a[i]=Math.pow(2,mu)*c[i];
	}
	

	var step = Math.pow(2, N);
	var supportWidth = a.length - 1;
	var values = createArray(supportWidth * step + 1, 2);

	//write the known values at integer points in 'values'
	for (var i = 0; i < sol.length; i++) {
		values[i*step][1] = sol[i][1];
		values[i*step][0] = i;
	}

	//write the remaining values in 'values'
	for (var j = 1; j < N + 1; j++) {

		//printMatrix(values);
		for (var l = 1; l < supportWidth * Math.pow(2, j); l += 2) {
			var k = 0;

			//index where the new value will be written in
			var index = Math.pow(2, N - j) * l;

			//index of the first required coefficient of the refinement formula
			var index2 = index * 2;

			//compute the first index2 within the compact support
			if (index2 > step * supportWidth) {
				ft = Math.ceil(index2 / step) - supportWidth;
				index2 = index2 - ft * step;
				k = ft;
			}

			values[index][1] = 0;
			//here the summation takes place
			values[index][0] = index / step;
			//x-value

			//if index2 < 0 then the y-values becomes zero
			for (k; k < a.length && index2 >= 0; k++) {
				values[index][1] += a[k] * values[index2][1];
				index2 -= step;
			}
		}
	}
	//console.log("The (iteratively computed) function-values are", values);
	return values;
}

/** Evaluate iteratively the mu-th derivative of a 1d refinable function
 *  on 2^{-j} with refinement mask a within its compact support [0, a.length].
 *  (similar to the MatLab-reference-code)
 *
 *	(last modification: 27.4.16 Andreas)
 *	@param{Array} 	a 		the refinement coefficients.
 * 	@param{int} 	j 		1/2^j is the step size of the x-lattice.
 *  @param{int}		mu		the derivative order >= 0.
 * 
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							function-values at these points in the form [x,y].
 */

function iterativePointEvaluation2(a, j, mu) {
	var N = a.length - 1;
	
	if(N <= 0){
		console.error('mask  a is too short');
	}
	
	//change with testCoeffs
	/*if (sum(a) !=2){
		console.error('mask a does not belong to a generator');
	}*/
	
	if(j === undefined && mu === undefined){
		j = 0;
		mu = 0;
	}
	
	if(mu === undefined){
		mu = 0;
	}
	
	//create the x-lattice with dyadic resolution j
	var pow2_j = Math.pow(2, j);
	var values = createArray(N * pow2_j + 1, 2);
	for(var i = 0; i < N * pow2_j + 1; i++){
		values[i][0] = i/pow2_j;
	}

	if(N == 1){
		//exclude the Haar generator case
		for(var i = 0; i < N * pow2_j; i++){
			values[i][1] = 1;
		}
		values[N * pow2_j][1] = 0;
	}
	else{
		/*
		for(var i = 0; i < N * pow2_j + 1; i++){
			values[i][1] = 0;
		}*/
		var v = calculateIntegerPointValues(a, mu);
		
		//write the known values at the integer points in 'values'
		for (var i = 0; i < v.length; i++) {
			values[i*pow2_j][1] = v[i][1];
		}
		
		//printMatrix(values);
		
		//console.log(1/Math.pow(2, j));
		//use the refinement equation to fill in the remaining values
		for(var l = 0; l < j; l++){
			var pow2_l = Math.pow(2, l);
			var pow2_minusl = 1/pow2_l;
			var pow2_j_minus_l = Math.pow(2, j - l);
			for(var m = 0; m < N * pow2_l; m++){
				result = 0;
				
				var k1 = Math.max(0, Math.ceil(pow2_minusl * (2 * m + 1)) - N);
				var k2 = Math.min(N, Math.floor(pow2_minusl * (2 * m + 1)));
				
				//console.log();
				
				for(var k = k1; k < k2 + 1; k++)
				{	
					var t = pow2_j_minus_l * (2 * m + 1) - pow2_j * k;
					//console.log(k);
					result += Math.pow(2, mu) * a[k]*values[Math.pow(2, j - l) *
						(2 * m + 1) - Math.pow(2,j) * k][1];
					//result += a[k]*values[pow2_j_minus_l * (2 * m + 1) - pow2_j * k][1];
					//console.log(values[t][1]);
					//console.log(pow2_j_minus_l * (2 * m + 1) - pow2_j * k);	
					//console.log(values[t][1][1]);
				}
				values[Math.pow(2, j - l - 1) * (2 * m + 1)][1] = result;
			}
		}
		return values;
	}
}