/** This file contains functions for matrix manipulations
 *
 *	(last modification: 22.4.16 Andreas)
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
	A = deepCopyMatrix(Matr);
	b = deepCopyVector(Vect);
	B = A;
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
	N = a.length;
	//number of coefficients
	
	//the boundary-coefficients have to be different from 0
	//check this if necessary
	//attach N-4 zeros in front of and behind the coefficient vector
	for ( i = 0; i < N - 4; i++) {
		a.push(0);
	}
	for ( i = 0; i < N - 4; i++) {
		a.unshift(0);
	}

	mat = createArray(N - 2, N - 2);
	
	//firstIndex is the index from which (going right to left) the
	//elements get included in the row;
	firstIndex = 1 + N - 4;
	for ( z = 0; z < N - 2; z++) {
		marker = firstIndex;
		for ( s = 0; s < N - 2; s++) {
			mat[z][s] = a[marker];
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

/** Display a 2dim mxn array on the console.
 * (last modification: 28.2.16 Simon)
 * 
 * @param{Array} Mat matrix to be displayed.
 * 
 * @return{undefined}
 */
function printMatrix(Mat) {
	for ( z = 0; z < Mat.length; z++) {
		asString = new String(" ");
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

/** Test the coefficients for being Daubechies-Wavelet-coefficients:
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
function testCoeffs(a, n) {

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

/** Compute the values of the wavelet at integer points by solving a linear
 *  system.
 *  (last modification: 1.3.16 Simon)
 * 
 *	@param{Array} a the Wavelet-coefficients.
 * 
 * 	@return{Array} sol y-values at the integer points with 0
 *  	and the "end of the compact support".
 */
function calculateIntegerPointValues(a) {
	var mat = coeffsToMatrix(a);
	//document.write("the matrix for the linear system: ");
	//document.write(mat);
	//console.log("the matrix for the linear system:");
	//printMatrix(mat);
	//append a last row vector of ones to the matrix
	//('norm condition')
	var s = mat[0].length;
	//s number of columns
	var lastRow = new Array(s);
	for (var i = 0; i < s; i++) {
		lastRow[i] = 1;
	}
	mat.push(lastRow);

	//append a last column of zeros to the matrix
	//Attention: eventually multiple solutions become possible?!
	for (var i = 0; i < mat.length; i++) {
		mat[i].push(0);
	}
	mat[0][mat.length - 1] = 1;

	//create the vector b
	var z = mat.length;
	
	//z stands for the number of rows
	var bb = new Array(s);
	for (var i = 0; i < z - 1; i++) {
		bb[i] = 0;
	}
	bb[z - 1] = 1;
	//console.log(mat,bb);
	var sol = gaus(mat, bb);
	//sol[sol.length-1]=0;
	sol.unshift(0);
	//console.log("phi at integer points:",sol);
	return sol;
}

