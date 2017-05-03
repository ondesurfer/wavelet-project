/** This file contains functions for mask manipulations.
 * 
 *  Dependencies: math.js, math2.js, matrixOperations.js
 *
 *	(last modification: 18.5.16 Andreas)
 */

/** Test the coefficients for being a mask of a refinable function
 * 	- their sum should be 2
 *  (last modification: 13.5.16 Andreas)
 * 
 *	@param{Array} a 	coefficients to be checked.
 * 	@param{int} n 		10^(-n) is the fault tolerance.
 * 
 * 	@return{boolean} true iff the coefficients pass the test.
 */
function testRefCoeffs(a, n) {	
	var faultTolerance = Math.pow(10, -n);
	var sum = 0;
	for(var i = 0; i < a.length; i++){
		sum += a[i];
	}
	if (Math.abs(sum - 2.0) > faultTolerance) {
		return false;
	}
	return true;
}

/** Test the coefficients for being a mask of a generator for orthogonal
 *  wavelets:
 * 	- their sum should be 2,
 *  - the sum over their squares should be also 2 and
 *  - sum(a(l) * a(l - 2k)) = 0 for fixed k.
 * 	(last modification: 11.4.16 Andreas)
 * 
 *	@param{Array} a 	coefficients to be checked.
 * 	@param{int} n 		10^(-n) is the fault tolerance.
 * 
 * 	@return{boolean} true iff the coefficients pass the test.
 */
function testOrthoCoeffs(a, n) {

	var faultTolerance = Math.pow(10, -n);

	var sum1 = 0;
	//sum of the coefficients should be 2
	var sum2 = 0;
	//sum over the squares of the coefficients should be 2
	for (var i = 0; i < a.length; i++) {
		sum1 += a[i];
		sum2 += (a[i] * a[i]);
	}

	//console.log(sum1);
	//console.log(sum2);
	if (Math.abs(sum1 - 2.0) > faultTolerance) {
		return false;
	}
	if (Math.abs(sum2 - 2.0) > faultTolerance) {
		return false;
	}

	//sum over a_l*a_(l-2k) should be 0 for all k!=0
	var sum3;
	
	//the summand a_l*a_(l-2k) is != 0,
	//if 0 <= l < a.length
	//and 0 <= l - 2*k < a.length, thus k <= l/2,
	//because supp(phi) lies completely in [0, N]
	//(note that JavaScript starts at 0 for indexing)
	for (var k = 1; k < a.length / 2; k++) {
		sum3 = 0;
		for (var l = 0; l < a.length; l++) {
			if ((l - 2 * k) >= 0) {
				sum3 += a[l] * a[l - 2 * k];
			}
		}
		//console.log(sum3);
		if (Math.abs(sum3) > faultTolerance) {
			return false;
		}
	}
	return true;
}

/** Get the Daubechies-2N-mask
* 	(last modification: 8.7.16 Andreas)
*   @param{int} m 	order of Daubechies scaling function, 1 <= m <= 4
*
*   @return{Array} [a, a_start] a 		the coefficients of the mask,
* 								a_start the start index of the refinement mask. 
*/
function getDaubCoeffs(m){
	var ac;
	switch(m) {
		case 1:
        	ac = [1, 1];
        	break;
		case 2:
        	ac = [(1+Math.sqrt(3))/4,(3+Math.sqrt(3))/4,(3-Math.sqrt(3))/4,
        		  (1-Math.sqrt(3))/4];
        	break;
    	case 3:
	        var theta = Math.sqrt(5+2*Math.sqrt(10));
	        ac=[(1+Math.sqrt(10)+theta)/16,
	           (5+Math.sqrt(10)+3*theta)/16,
	           (5-Math.sqrt(10)+theta)/8,
	           (5-Math.sqrt(10)-theta)/8,
	           (5+Math.sqrt(10)-3*theta)/16,
	           (1+Math.sqrt(10)-theta)/16];
	        break;
    	case 4:
	        var u=700+210*Math.sqrt(15);
	        var v=(28+6*Math.sqrt(35))*Math.pow(u,(1/3))-70*Math.pow(2,(1/3))
	        		+Math.pow((2*u),(2/3));
	        var s=(Math.pow(56*u,(1/3))*Math.sqrt(v)+70*Math.pow(2,(1/3))
	        		*Math.sqrt(v)-Math.pow((2*u),(2/3))*Math.sqrt(v)
	        		+12*Math.pow(u,(1/3))*Math.sqrt(35*v)+336*Math.sqrt(3*u)
	        		+48*Math.sqrt(105*u))/(Math.pow(u,(1/3))*Math.sqrt(v));
	            	
	        var alpha=0.5+0.5*Math.sqrt(35)+Math.sqrt(3*v/Math.pow(u,(1/3)))/
	        			6+Math.sqrt(3*s)/6;
	        console.log("u,v,s,alpha");
	        console.log(u,v,s,alpha);
	        ac=mult(1/32, conv([1,4,6,4,1],[alpha,2-Math.sqrt(140)+5/
	        		alpha,2+Math.sqrt(140)-alpha,-5/alpha]));
	        break;
	    default: 
        	console.log('illegal order m');
	}
	return ac;
}

/** Generate cardinal B-Spline-mask of order d.
 *  (last modification: 18.5.16 Andreas)
 *
 *  @param{int} d the order of the B-spline.
 * 
 *  @return{Array} [a, a_start] a 		the coefficients of the mask,
 * 								a_start the start index of the refinement mask. 
 */
function genBSplineCoeffs(d){
	var a = [Math.pow(2,(1 - d)),Math.pow(2,(1 - d))];
	var a_start = - Math.floor(d/2);
	for(var k = 2; k < d + 1; k++){
		a = conv(a, [1, 1]);
	}
	return [a,a_start];
}

/** Generate the refinement mask of the dual B-spline-generator of order m
 *  and approximation order mt where m+mt is even.
 *  (last modification: 18.5.16 Andreas) 
 * 
 *  @param{int} m spline order.
 *  @param{int} mt approximation order.
 * 
 *  @return{Array} [a, a_start] a 		the coefficients of the mask,
 * 								a_start the start index of the refinement mask. 
 */
function genDualBSplineCoeffs(m, mt){
	if(m <= 0){
	    console.error('m must be >=1');
	}
	if(mt <= 0){
	    console.error('mt must be >=1');
	}
	if((m + mt) % 2 !=0){
	    console.error('m+mt must be even');
	}
	
	var uh2 = [1, -2, 1]; // (z-1)^2
	
	var K = (m + mt)/2;
	
	var a = [0];
	var uh2a = [1]; // 1
	for(var k = 0; k < K; k ++){
	    var zpower =[1].concat(zerosVec(K - 1 - k));
	    a = polyAdd1(a, mult(nchoosek(K - 1 + k, k)/Math.pow((-4), k),
	    		conv(zpower, uh2a)));
	    uh2a = conv(uh2a, uh2);
	}
	a = conv(a, genBSplineCoeffs(mt)[0]);
	var a_start = -Math.floor(m/2) - mt + 1;
	
	return [a, a_start];
}
