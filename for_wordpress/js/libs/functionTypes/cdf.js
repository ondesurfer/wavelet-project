/**
 *	This file contains the methods calculate the values of cdf scf and wavelets
 *
 * 	Dependencies:
 * numeric-1.2.6.js, matrixOperations.js, math2.js
 */


/** calculates values of cdf scf and wavelets 
 * 
 *
 *   @param{double[]} mask - mask of cdf scf
 * 	@param{double[]} dualMask - mask of dual cdf scf
 *  @param{int} aStart - index of first mask-entry of primal scf
 *  @param{int} aTildeStart - index of first mask-entry of dual scf
 *  @param{int} deli - delitation of mother wavelet
 *  @param{int} trans - translatation of delitated mother wavelet
 *  @param{int} acc - accuracy, depth of iteration
 * 
 * 	@return{double [][] values - values of cdf Wavelet}
 *  (last modification: 25.05.17 Simon)
 * 
 */

function valuesOfCDFWav(mask,dualMask,aStart,aTildeStart,deli,trans,acc){
	var valuesWav=waveletPointEvaluation(mask, aStart, dualMask, aTildeStart, acc); 
	return deliAndTrans(deli,trans,valuesWav);
}



/** calculates values of primal cdf scf 
 *
 *   @param{double[]} mask - mask of cdf scf
 *  @param{int} aStart - index of first mask-entry
 *  @param{int} deli - delitation of mother scf
 *  @param{int} trans - translatation of delitated mother scf
 *  @param{int} acc - accuracy, depth of iteration
 * 
 * 	@return{double [][]} values - values of cdf scf
 *  (last modification: 25.05.17 Simon)
 * 
 */
function valuesOfCDFScf(mask,aStart,deli,trans,acc){
	var valuesScf = iterativePointEvaluation2(mask, aStart, acc, 0);
	return deliAndTrans(deli,trans,valuesScf);
}



/** calculates values of dual primal cdf scf 
 *
 * (exact same method as valuesOfCDFScf - added for code consistancy)
 *
 *   @param{double[]} mask - mask of dual cdf scf
 *  @param{int} aTildeStart - index of first dual-mask-entry
 *  @param{int} deli - delitation of mother scf
 *  @param{int} trans - translatation of delitated mother scf
 *  @param{int} acc - accuracy, depth of iteration
 * 
 * 	@return{double [][]} values - values of cdf scf
 *  (last modification: 25.05.17 Simon)
 * 
 */

function valuesOfDualCDFScf(dualMask,aTildeStart,deli,trans, acc){
	var valuesDscf=iterativePointEvaluation2(dualMask, aTildeStart, acc, 0);  
	return deliAndTrans(deli,trans,valuesDscf);
}
