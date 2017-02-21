/** Evaluate iteratively the mu-th derivative of a 1d refinable function
 *  on 2^{-j} with refinement mask a within its compact support [0, a.length].
 *  (similar to the MatLab-reference-code)
 *
 *	(last modification: 27.4.16 Andreas)
 *	@param{Array} 	a 		the refinement coefficients.
 *  @param{int}		a_start the start index of the refinement mask.
 * 	@param{int} 	j 		(1/2)^(-j) is the step size of the x-lattice.
 *  @param{int}		mu		the derivative order >= 0.
 * 
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							function-values at these points in the form [x,y].
 */

function iterativePointEvaluation2(a, a_start, j, mu) {
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
		values[i][0] = i/pow2_j + a_start;
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
		//use the refinement equation to fill in the remaining values
		for(var l = 0; l < j; l++){
			var pow2_l = Math.pow(2, l);
			var pow2_minusl = 1/pow2_l;
			var pow2_j_minus_l = Math.pow(2, j - l);
			for(var m = 0; m < N * pow2_l; m++){
				result = 0;
				
				var k1 = Math.max(0, Math.ceil(pow2_minusl * (2 * m + 1)) - N);
				var k2 = Math.min(N, Math.floor(pow2_minusl * (2 * m + 1)));
				
				for(var k = k1; k < k2 + 1; k++)
				{	
					//var t = pow2_j_minus_l * (2 * m + 1) - pow2_j * k;
					result += Math.pow(2, mu) * a[k]*values[Math.pow(2, j - l) *
						(2 * m + 1) - Math.pow(2,j) * k][1];
				}
				values[Math.pow(2, j - l - 1) * (2 * m + 1)][1] = result;
			}
		}
	}
	return values;
}


/** Evaluate the points of a wavelet by its representation as a sum of
 *  weighted translations of the scaling function with weights from the dual
 *  scaling function.
 * 
 *  @param{Array}	a				refinement coefficients of the generator.
 *  @param{int}		a_start			the start index of the refinement coefficients.
 *  @param{Array} 	a_tilde the 	refinement coefficients of the dual generator.
 * 	@param{int}		a_tilde_start	the index of the first non-vanishing 
 * 									refinement coefficient.
 * 	@param{int} 	j 				(1/2)^(-j) 	the step size of the x-lattice.
 *
 * 	@return{Array} 	values  the array of x-lattice-points and the corresponding
 * 							wavelet-values at these points in the form [x,y].
 */
// ist es notwendig a und a_tilde zu ubergeben, statt nur a ? - ja, dann geht es fuer OMRA und BiOMRA
function waveletPointEvaluation(a, a_start, a_tilde, a_tilde_start, j){
	var N = a.length - 1; //support of phi
	var N_tilde = a_tilde.length - 1;  //support of phi-tilde
	var sf_values = iterativePointEvaluation2(a, a_start, j - 1, 0);
	var b_array = refCoeffstoWaveletCoeffs(a_tilde, a_tilde_start);
	var b = b_array[0]; //achtung evtl. b zerstoert.
	var b_start = b_array[1];
	
	//create the x-lattice with dyadic resolution j
	var pow2_j = Math.pow(2, j);
	var pow2_j_minus1 = Math.pow(2, j - 1);
	var pow2_minusj_plus1 = 1/pow2_j_minus1;
	
	var wavelet_support = (N_tilde + N)/2;
	var values = createArray(wavelet_support * pow2_j + 1, 2);
	
	for(var i = 0; i < values.length; i++){
		values[i][0] = i/pow2_j + a_start;	
	}
	
	var result = 0;		
	for(var m = 0; m < values.length; m++){
		result = 0;
		
		var k1 = Math.max(0, Math.ceil(pow2_minusj_plus1 * m) - N);
		var k2 = Math.min(N_tilde, Math.floor(pow2_minusj_plus1 * m));
		
		
		for(var k = k1; k < k2 + 1; k++)
		{	
			result +=  b[k]*sf_values[m - pow2_j_minus1*k][1];
		}
		values[m][1] = result;
	}
	return values;
}

/**
 * First delitates a function with factor 2^-j and then translates it with k (usually integer)
 * @param {double} k translation
 * @param {integer} j (2^-j) is delitation factor
 * @param {Array} values already known values
 * 
 * @return {Array} newValues new function values 
 */
function deliAndTrans(j,k,values){
	var newValues = createArray(values.length,2);
	for(var l=0; l<values.length; l++){
		//copies y-values
		newValues[l][1]=values[l][1];
		//delitates x-values
		newValues[l][0]=Math.pow(2,-j)*values[l][0];
	}
	//console.log("newValues1",newValues);
	for(var m=0; m<values.length; m++){
		//console.log("k",k);
		//translates x-values
		newValues[m][0]=newValues[m][0]+k;
	}
	return newValues;
}
