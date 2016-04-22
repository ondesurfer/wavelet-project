/** This file contains functions for point evaluations of wavelets with given
 *  refinement coefficients and step size of the x-lattice
 *
 *	(last modification: 22.4.16 Andreas)
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
function naiveRecursivePointEvaluation(a, N) {
	var solu = calculateIntegerPointValues(a);

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
function recursivePointEvaluation(a, N) {
	var solu = calculateIntegerPointValues(a);

	var supportWidth = a.length - 1;
	var step = Math.pow(2, N);
	var values = createArray(step * supportWidth + 1, 2);
	//fill in the known values at the integer points
	for (var i = 0; i < supportWidth + 1; i++) {
		values[i*step][0] = i;
		values[i*step][1] = solu[i];
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

	for (var i = 0; i < step * supportWidth + 1; i++) {
		phi(N, i);
	}

	return values;
}

/** Evaluate recursively the wavelet at points where it is not vanishing with
 *  memory of already computed values.
 *
 *	(last modification: 22.4.16 Andreas)
 *	@param{Array} 	a 			the refinement coefficients.
 *  @param{Array} 	valuesOld 	already computed values of the wavelet which
 * 								should be refined or coarsened
 * 								(adapt the size of the array!).
 * 	@param{real} 	leftXValue	left end of the plotting-/computing-area.
 *  @param{real}	RightXValue right end of the plotting-/computing-area.
 *
 * 	@return{Array} 	values  	the array of x-lattice-points and the
 * 								corresponding wavelet-values at these points
 * 								in the form [x,y].
 */
function recursivePointEvaluation2(a, leftXValue, rightXValue, valuesOld) {
	var supportWidth = a.length - 1;

	//number of equidistant x-lattice-points in the plot-area
	var M = 300;

	//step size
	var delta = (rightXValue - leftXValue) / M;

	//new N, step and values-array for the new j-level
	var Nnew = Math.ceil(Math.log(1 / delta) / Math.LN2);
	var stepNew = Math.pow(2, Nnew);
	var valuesNew = createArray(stepNew * supportWidth + 1, 2);

	//compute the old N and the old step from valuesOld
	var stepOld = (valuesOld.length - 1) / supportWidth;

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

	//index from which forward the values of the (zoomed) plot are required
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
			phi(Nnew, i);
		}
	}

	//trim the values to the nessecary ones
	var valuesNecessary = valuesNew.slice(indexNewLinks, indexNewRechts);

	//return of the new values (usually are a lot of entries undefined),
	//and the necessary values
	var result = [valuesNew, valuesNecessary];
	return result;
}

/** Evaluate iteratively the wavelet at points where it does not vanish.
 *
 *	(last modification: 12.4.16 Andreas)
 *	@param{Array} 	a 		the refinement coefficients.
 * 	@param{int} 	N 		1/2^N is the step size of the x-lattice.
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							wavelet-values at these points in the form [x,y].
 */

function iterativePointEvaluation(a, N) {
	var sol = calculateIntegerPointValues(a);

	var step = Math.pow(2, N);
	var supportWidth = a.length - 1;
	var values = createArray(supportWidth * step + 1, 2);

	//write the known values at integer points in 'values'
	for (var i = 0; i < sol.length; i++) {
		values[i*step][1] = sol[i];
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

			//if index2 < 0 then the y-values become zero
			for (k; k < a.length && index2 >= 0; k++) {
				values[index][1] += a[k] * values[index2][1];
				index2 -= step;
			}
		}
	}
	//console.log("The (iteratively computed) function-values are", values);
	return values;
}
