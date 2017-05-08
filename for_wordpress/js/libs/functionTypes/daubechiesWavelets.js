/**
 *	This file contains the methods calculate the values of daubechies scf and wavelets
 *
 * 	Dependencies:
 * numeric-1.2.6.js, matrixOperations.js, math2.js
 */


/** calculates values of daubechies scf and wavelets 
 * 
 *
 *   @param{double[]} mask - mask of daubechies wavelet
 *  @param{int} a_start - index of first mask-entry
 *  @param{int} deli - delitation of mother wavelet
 *  @param{int} trans - translatation of delitated mother wavelet
 *  @param{int} acc - accuracy, depth of iteration
 * 
 * 	@return{double [][] values - values of daubechies Wavelet}
 *  (last modification: 02.05.17 Simon)
 * 
 */
function valuesOfDaubechiesWav(mask,a_start,deli,trans,acc){
	var values1 = waveletPointEvaluation(mask, a_start, mask, a_start, acc); 
	return deliAndTrans(deli,trans,values1);
}

//same function as above, but different input-parameters
//deliTrans are just for delitation and translatation - can be changed by user in the browser
//params are mask, a_start and accurancy - are not supposed to be changed by the user
function valuesOfDaubechiesWav2(deliTrans, params){
	
	var deli = deliTrans[0];
	var trans = deliTrans[1];
	
	var mask= params[0];
	var a_start = params[1];
	var acc = params[2];
	
	var values1 = waveletPointEvaluation(mask, a_start, mask, a_start, acc); 
	return deliAndTrans(deli,Math.pow(2,-1*deli)*trans,values1);
}

/** calculates values of daubechies scf 
 *
 *   @param{double[]} mask - mask of daubechies scf
 *  @param{int} a_start - index of first mask-entry
 *  @param{int} deli - delitation of mother scf
 *  @param{int} trans - translatation of delitated mother scf
 *  @param{int} acc - accuracy, depth of iteration
 * 
 * 	@return{double [][]} values - values of daubechies scf
 *  (last modification: 02.05.17 Simon)
 * 
 */
function valuesOfDaubechiesScf(mask,a_start,deli,trans,acc){
	var values1 = iterativePointEvaluation2(mask, a_start, acc, 0);
	return deliAndTrans(deli,trans,values1);
}
