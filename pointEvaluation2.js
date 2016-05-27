/** This file contains functions for point evaluations of wavelets
 *  with given coefficients of the (dual) scaling function
 *
 *	(last modification: 18.5.16 Andreas)
 */

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
// ist es notwendig a und a_tilde zu ubergeben, statt nur a ?
function waveletPointEvaluation(a, a_start, a_tilde, a_tilde_start, j){
	var N = a.length - 1; //support of phi
	var N_tilde = a_tilde.length - 1;  //support of phi-tilde
	console.log("N_tilde", N_tilde);
	var sf_values = iterativePointEvaluation2(a, j - 1, 0);
	var b_array = refCoeffstoWaveletCoeffs(a_tilde, a_tilde_start);
	var b = b_array[0]; //achtung evtl. b zerstoert.
	var b_start = b_array[1];
	
	//create the x-lattice with dyadic resolution j
	var pow2_j = Math.pow(2, j);
	//var pow2_j_plus1 = Math.pow(2, j + 1);
	var pow2_j_minus1 = Math.pow(2, j - 1);
	var pow2_minusj_plus1 = 1/pow2_j_minus1;
	
	var wavelet_support = (N_tilde + N)/2;
	console.log("wavelet_supp", wavelet_support);
	var values = createArray(wavelet_support * pow2_j + 1, 2);
	
	console.log("-a_start", -a_start);
	console.log("-a_start", -a_start);	
	//console.log("pow2_j_plus1", pow2_j_plus1);
	
	for(var i = 0; i < values.length; i++){
		values[i][0] = i/pow2_j + a_start;	
	}
	
	console.log("values.length", values.length);	
	
	var result = 0;		
	for(var m = 0; m < values.length; m++){
		result = 0;
		//var k1 = Math.max(0, Math.ceil(pow2_minusj_plus1 * m) - N - a_start);
		//var k2 = Math.min(N_tilde, Math.floor(pow2_minusj_plus1 * m) - a_start);
		
		var k1 = Math.max(0, Math.ceil(pow2_minusj_plus1 * m) - N);
		var k2 = Math.min(N_tilde, Math.floor(pow2_minusj_plus1 * m));
		
		
		for(var k = k1; k < k2 + 1; k++)
		{	
			console.log("m",m);
			console.log("k1",k1);
			console.log("k2",k2);
			console.log("k", k);		
			// console.log("sf_values_index", m - pow2_j*k - pow2_j_minus1*a_start);
			// result +=  b[k]*sf_values[m - pow2_j_minus1*k - pow2_j_minus1*a_start][1];
			
			console.log("sf_values_index", m - pow2_j*k);
			result +=  b[k]*sf_values[m - pow2_j_minus1*k][1];
		}
		values[m][1] = result;
		// console.log(values[m][1]);
	}
	return values;
}


