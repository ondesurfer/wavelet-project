/** This file contains further functions for mathematical purposes
 *
 *	(last modification: 13.5.16 Andreas)
 */

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
