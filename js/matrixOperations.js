/** This file contains functions for matrix manipulations
 *
 *	(last modification: 13.5.16 Andreas)
 */

/**Search pivot-elements of a matrix.
 * 
 * @param{Array} 	matrix	the matrix of the linear system to be solved.
 * 
 * @return{Array} 	pivotA 	vector with the indices of the row to be choosen.
 */
function pivot(matrix) {
	var A = deepCopyMatrix(matrix);
	var n = A.length;
	var pivotA = new Array(n);
	for ( j = 0; j < n - 1; j++) {
		max = Math.abs(A[j][j]);
		imax = j;
		for ( i = j + 1; i < n; i++) {
			if (Math.abs(A[i][j]) > max) {
				max = Math.abs(A[i][j]);
				imax = i;
			}
		}
		h = A[j];
		A[j] = A[imax];
		A[imax] = h;
		pivot[j] = imax;
		for ( i = j + 1; i < n; i++) {
			f = -A[i][j] / A[j][j];
			for ( k = j + 1; k < n; k++)
				A[i][k] += f * A[j][k];
			A[i][j] = -f;
		}
	}
	return pivotA;
}

/** Solve a quadratic linear system of equations with pivot search.
 * 
 * @param{Array} A the matrix of the linear system Ax=b.
 * @param{Array} b the vector of the linear system Ax=b.
 * 
 * @return{Array} x the solution vector.
 */
function solve(Matr, Vect) {
	var A = deepCopyMatrix(Matr);
	var b = deepCopyVector(Vect);
	var B = A;
	//originally A.clone
	x = b;
	//originally b.clone
	var pivotA = pivot(B);
	n = B.length;
	for ( i = 0; i < n - 1; i++) {
		h = b[pivot[i]];
		b[pivotA[i]] = b[i];
		b[i] = h;
	}
	for ( j = 0; j < n; j++) {
		x[j] = b[j];
		for ( i = 0; i < j; i++)
			x[j] -= B[j][i] * x[i];
	}
	for ( j = n - 1; j >= 0; j--) {
		for ( k = j + 1; k < n; k++)
			x[j] -= B[j][k] * x[k];
		x[j] /= B[j][j];
	}
	return x;
}

function deepCopyMatrix(matrix) {
	var newMatrix = createArray(matrix.length, matrix[0].length);
	for (var z = 0; z < newMatrix.length; z++) {
		for (var s = 0; s < newMatrix[0].length; s++) {
			newMatrix[z][s] = matrix[z][s];
		}
	}
	return newMatrix;
}

function deepCopyVector(vector) {
	var newVector = new Array(vector.length);
	for (var i = 0; i < newVector.length; i++) {
		newVector[i] = vector[i];
	}
	return newVector;
}

/** Sort the coefficients of a wavelet into a matrix.
 *  Only works for more than 3 coefficients!!!
 * 
 * @param{Array} a refinement coefficients
 * 
 * @return{Array} mat the matrix with the sorted coefficients
 */
function coeffsToMatrix(a) {
	var c = new Array();
	//copy a to c
	for (var i = 0; i < a.length; i++) {
		c[i] = a[i];
	}
	var N = c.length;
	//number of coefficients
	
	//the boundary-coefficients have to be different from 0
	//check this if necessary
	//attach N-4 zeros in front of and behind the coefficient vector
	for ( i = 0; i < N - 4; i++) {
		c.push(0);
	}
	for ( i = 0; i < N - 4; i++) {
		c.unshift(0);
	}

	var mat = createArray(N - 2, N - 2);
	
	//firstIndex is the index from which (going right to left) the
	//elements get included in the row;
	var firstIndex = 1 + N - 4;
	for ( z = 0; z < N - 2; z++) {
		var marker = firstIndex;
		for ( s = 0; s < N - 2; s++) {
			mat[z][s] = c[marker];
			marker--;
		}
		firstIndex += 2;
	}
	
	//subtract 1 from the diagonal
	for (var i = 0; i < N - 2; i++) {
		mat[i][i] = mat [i][i] - 1;
	}
	return mat;
}

/** Second possibility to sort the coefficients of a wavelet into a matrix. 
 *  (Also works for wavelets with only 3 coefficients! e.g. hat-function)
 * 
 * @param{Array} a refinement coefficients
 * @param{int}	  mu the derivation-order	
 * 
 * @return{Array} mat the matrix with the sorted coefficients
 */
function coeffsToMatrix2(akk, mu) {

	var N = akk.length;
	var pow2_minus_mu = Math.pow(2, -mu);
	var mat2 = createArray(N - 2, N - 2);
	
	//fill all entries by 0 
	for ( var z = 0; z < N - 2; z++) {
		for ( var s = 0; s < N - 2; s++) {
			mat2[z][s] = 0;
		}
	}

	//fill up the right values of the matrix by the wavelet coefficients ak
	for(var k=0; k < N-2;k++){
		for(var l= Math.max(0,2*k-(N-1)+1); l<=Math.min(N-3,2*k+1);l++){
			index=2*k-l+1;
			mat2[k][l]=akk[2*k-l+1];
		}
	}
	
	//sub 2^(-mu) at the diagonals because we will solve 0=(A-(2^(-mu))Id)v)
	for (var i = 0; i < N - 2; i++) {
		mat2[i][i] = mat2 [i][i] - pow2_minus_mu;
	}
	//printMatrix(mat2);
	return mat2;
}

/** Display a 2dim mxn array on the console.
 * (last modification: 28.2.16 Simon)
 * 
 * @param{Array} Mat matrix to be displayed.
 * 
 * @return{undefined}
 */
function printMatrix(Mat) {
	for ( z = 0; z < Mat.length; z++) {
		var asString = new String(" ");
		//attach all numbers of a row to one string
		for ( s = 0; s < Mat[0].length; s++) {
			asString = asString + " " + Mat[z][s];
		}
		//return the string together with a blank
		console.log(asString);
		console.log(" ");
	}
}

/** Create an array of any dimension
 *     (f.e.: (2,3)-creates a 2x3 matrix; (2,2,2) creates a 3
 * 		dim 2x2x2 'matrix')
 *	(last modification: 28.2.16 Simon)
 * 
 *	@param{int,int..} length.
 * 
 * 	@return{Array} arr.
 */
/*function createArray(length) {
 var arrr = new Array(length || 0),
 i = length;

 if (arguments.length > 1) {
 var args = Array.prototype.slice.call(arguments, 1);
 while(i--) arrr[length-1 - i] = createArray.apply(this, args);
 }

 return arrr;
 }*/

function createArray(length1, length2) {
	var array = new Array(length1);
	for (var i = 0; i < length1; i++) {
		array[i] = new Array(length2);
	}

	//printMatrix(array);
	return array;
}

/** Compute the values of the wavelet at integer points by solving a linear
 *  system.
 *  (last modification: 3.5.16 Andreas)
 * 
 *	@param{Array} a the Wavelet-coefficients.
 *  @param{int}	  mu the derivation-order	
 * 
 * 	@return{Array} sol y-values at the integer points with 0
 *  	and the "end of the compact support".
 */

function calculateIntegerPointValues(a, mu) {
	var N = a.length - 1;
	//tests if the Wavelet is the Haar-Wavelet and then returns the y values 0 and 1
	//eventuell ist es sinnvoller das Haar-Wavelet bereits frueher abzufangen, 
	//da es dann nicht verfeinert wird.
	//gilt das auch noch fuer mu > 0 ? Ja und das wird schon in der Auswertung abgefangen
	// if(a.length==2){
		// var mat3=new Array(2);
		// mat3[0]=1;
		// mat3[1]=0;
		// return formatIntegerPointValues(mat3);
	// }
	
	//sparsify if possible
	var mat = coeffsToMatrix2(a, mu);
	
	var m1 = Math.max(N - 1, mu + 1);
	//console.log("m1",m1);
	var V = vander90(onetwothree(m1));
	//printMatrix(V);
	V = numeric.getBlock(V, [0,0], [mu, N-2]);
	//printMatrix(V);
	
	
	//append the matrix V row-wise
	mat = mat.concat(V);
	
	//create the vector b
	var b = new Array((N - 1) + mu + 1);
	//console.log("N",N,"mu",mu);
	//console.log(typeof(mu));
	//console.log((N-1)+mu);
	for (var i = 0; i<(N-1)+mu; i++) {
		//console.log("i",i);
		b[i] = 0;
	}
	
	b[(N - 1) + mu] = Math.pow((-1), mu) * factorial(mu);

	
	
	//console.log(mat,b);
	
	var sol = gaus2(mat, b);
	
	//console.log(sol);
	
	//adds zero at the end and the beginning of the solution Vektor 
	//because phi(0)=0 and phi(a.length)=0  
	
	//printMatrix(mat);
	
	//console.log(sol);
	
	//fuer Haar-Wavelet rausnehmen?	
	 sol.push(0);
	 sol.unshift(0);
	
	console.log("phi at integer points:",sol);
	return formatIntegerPointValues(sol);
}


/** Brings the integer-point values to the form as calculated in the point evaluation methods:
 *  [[x-value0,y-value0],[x-value1,y-value1],...]
 *  (last modification: 24.4.16 Simon)
 * 
 *	@param{Array} sol y-values at the integer points with 0
 *  	and the "end of the compact support".
 * 
 * 	@return{Array} values x-and y values in the format described before
 */
function formatIntegerPointValues(sol){
	var values=createArray(sol.length,2);
	for(var i=0;i<sol.length;i++){
		values[i][0]=i;
		values[i][1]=sol[i];
	}	
	return values;
}

/** Returns the sum of all entries of an 1D-array.
 *  (last modification: 27.4.16 Andreas)
 * 
 * 	@param{Array} a 1D-array of real numbers.
 * 
 *  @return{real} sum the sum of all entries.
 */
function sum(a) {
	var result = 0;
	for(var i=0; i < a.length; i++){
		result += a[i];
	}
	return result;
}

/** Create a nxn-Matrix with all entries = 1.
 * (last modification 3.5.16 Andreas) 
 * 
 *  @param{int} n size of the array.
 * 
 * 	@return{Array} A the matrix.
 */
function ones(n) {
	var A = new Array(n);
	for (var i = 0; i < n; i++) {
		A[i] = new Array(n);
		for(var j = 0; j < n; j++) {
			A[i][j] = 1;
		}
	}

	return A;
}

/** Create a vector of length n with all entries = 0.
 * (last modification 17.5.16 Andreas) 
 * 
 *  @param{int} n size of the array.
 * 
 * 	@return{Array} A the matrix.
 */
function zerosVec(n) {
	var A = new Array(n);
	for (var i = 0; i < n; i++) {
		A[i] = 0;
	}

	return A;
}

/** Multiply a vector of length n with a real scalar
 *  (last modification Andreas 17.5.16)
 * 
 *  @param{Array} a 		the input vector. 
 *  @param{float} lambda 	the input scalar.
 *  
 *  @return{Array} b		the product lambda * a.
 */
function mult(lambda, a){
	var b = new Array(a.length);
	for(i = 0; i < a.length; i++){
		b[i] = a[i] * lambda; 
	}
	return b; 
}

/** Create the Vandermonde-matrix of size n.
 *	(last modification 3.5.16 Andreas)
 * 
 *  @param{Array} x entries x_1, x_2, ..., x_n of the second column.
 * 
 *  @return{Array} A the Vandermonde-matrix. 
 */

//Achtung stimmt nicht mit wikipedia ueberein
function vander90(x) {
	var n = x.length;
	var A = createArray(n,n);
	for (var i = 0; i < n; i++) {
		for(var j = 0; j < n; j++) {
			A[j][i] = Math.pow(x[i],j);
		}
	}

	return A;
}

/** Rotate a nxn-matrix 90 degrees counterclockwise
 *  (last modification 3.5.16 Andreas)
 * 
 *  @param{Array} A a quadratic array.
 * 
 *  @return{Array} B the rotated array.
 */
function rot90(A) {
	var n = A.length;
	var B = new Array(n);
	for(var i = 0; i < n; i++) {
		B[i] = new Array(n);
		for(var j = 0; j < n; j++) {
			B[i][j] = A[j][n - i - 1];
		}
	}
	return B;
}

/** Creates an array of integers from 1 to n.
 *  (last modification 3.5.16 Andreas)
 * 
 *   @param{int} n the size of the array.
 * 
 *   @return{Array} A = [1,2, ..., n].
 */
function onetwothree(n){
	//console.log(n);
	var A = new Array(n);
	for(i = 0; i < n; i++){
		A[i] = i + 1;
	}
	return A;
}

/**	Creates an array of integers with n + 1 entries and increment m
 * 	beginning at a start integer.
 *  (last modification 9.7.16 Andreas)
 * 
 * 	@param{int}	start	the integer to start with.
 * 	@param{int} n		the number of entries.
 * 	@param{int} m		the increment size.
 * 	
 * 	@param{return} A = [start, start + m, ..., start + n * m]
 */

function onemtwom(start,n,m){
	//console.log(n);
	var A = new Array(n);
	for(i = 0; i < n + 1; i++){
		A[i] = start + i*m;
	}
	return A;
}
/** Compute the discrete convolution of two vectors
 *  (last modification: 12.5.16 Andreas)
 * 
 *   @param{Array} a the first vector.
 * 	 @param{Array} b the second vector.
 * 
 *   @param{Array} c the convolution of a and b.
 */
function conv(a,b){
	var m = a.length;
	var n = b.length;
	var p = m + n - 1; // length of the convolution vector
	var c = new Array(p);
	for(var k = 0; k < p; k++){
		c[k] = 0;
		j = 0;
		while(k - j > n - 1){
			j++;	
		}
		while(k - j >= 0 && j < m){
			c[k] += a[j]*b[k - j];
			j++;
		}
	}
	return c;
}
