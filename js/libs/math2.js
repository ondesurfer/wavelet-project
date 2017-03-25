/** This file contains further functions for mathematical purposes
 *
 *	Dependencies: matrixOperations.js
 *
 *	(last modification: 17.8.16 Andreas)
 */

/**
 * Get the length of a number.
 * (last modification: 17.8.16 Andreas)
 * 
 * @param{int}	number.
 * 
 * @return{int}	the number length.
 */
function getNumberlength(number) {
    return number.toString().length;
}

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

/**
 * Convert the coefficients of a polynomial to a string-representation.
 * (last modification 21.9.16 Andreas)
 * 
 *	 @param{Array} coefficients.
 *  
 * 	 @return{String} stringRepresentation.
 */
function coeffsToStringRepresentation(coeffs){
	stringRepresentation = coeffs[0].toString();
	if(coeffs.length > 1){
		stringRepresentation += '+'+coeffs[1].toString()+'*x';
	}
	for(var i = 2; i < coeffs.length; i++){
		stringRepresentation += '+'+coeffs[i].toString()+'*x^'+i.toString();
	}
	return stringRepresentation;
}

/**
 *  Get the coefficients of the coefficients of the mth derivative
 *  of a polynomial with degree n.
 *  (last modification 23.9.16 Andreas)
 *  
 *    @param{Integer} n		degree of the polynomial.
 *    @param{Integer} m		derivative-order ( m <= n+1).
 *    
 *    @param{Array}	  a		coefficients.
 */
function getPolyDerivativeCoefficients(n,m){
	var a = [];
	
	for(var i = 0; i < m; i++){
		a[i] = 0;
	}
	
	for(var i = m; i < n + 1; i++){
		var b = i;
		for(var j = 1; j < m; j++){
			b *= i - j;
		}
		a[i] = b;
	}
	return a;
}

/**
 *  Compute the spline coefficients of a cubic spline from given control
 *  points. It is assumed that there are four control points per interval
 *  (counted with multiplicity for C^0-, C^1- or C^2-transitions between
 *  the polynomials).
 *  (last modification 23.9.16 Andreas)
 *  
 *  @param{Array} controlPointsX	array with the x-coordinates of the points.
 *  @param{Array} controlPointsY	array with the y-coordinates of the points.
 *  
 *  @return{Array} coefficients.
 */
function computeCubicSplineCoeffs(controlPointsX, controlPointsY){
	if(controlPointsX.length != controlPointsY.length){
		console.error("Dimensions of controlPointsX and controlPointsY" +
				" mismatch.");
	}
	
	var n = controlPointsX.length;
	numberOfIntervals = n/4;

	if(!(Number.isInteger(numberOfIntervals))){
		console.log(numberOfIntervals);
		console.error("The number of points ist not a multiple of 4.");
	}
	
	var M = zeros(n);
	var b = new Array(n);
	for(var i = 0; i < numberOfIntervals; i++){
		
		// array to save the x-coordinates of the control points for the
		// current interval
		var controlPointsX_i = new Array(4);
		controlPointsX_i[0] = controlPointsX[4*i];
		
		b[4*i] = controlPointsY[4*i];
		
		var multipleKnots = 0;
		// count the multiplicity of the knot at the end of the interval
		for(var j = 1; j < 4; j ++){
			controlPointsX_i[j] = controlPointsX[4*i + j];
			b[4*i + j] = controlPointsY[4*i + j];
			
			if(controlPointsX[4*i + 3] == controlPointsX_i[j]){
				multipleKnots++;
			}
		}
		
		var M_i = vander(controlPointsX_i);
		
		setBlockMatrix(M, M_i, 4*i, 4*i);
		
		var derivativeCoeffs = [];
		
		// modify the matrix in the case of multiple knots
		// begin with j = 2, because C^0-regularity amounts no matrix-change
		var coeff_pot = 0;
		for(var j = 2; j < multipleKnots + 1; j++){
			derivativeCoeffs = getPolyDerivativeCoefficients(3, j - 1);
			for(var k = 0; k < 4; k++){
				/*console.log("derivativeCoeffs", derivativeCoeffs[k]);
				console.log("(controlPointsX[4*i + k])",
						Math.pow(controlPointsX[4*i + k], k - j + 1));*/
				coeff_pot = Math.pow(controlPointsX[4*i + k], k - j + 1);
				if(coeff_pot == Infinity){
					coeff_pot = 0;
				}
				//console.log("coeff_pot", coeff_pot);
				M[4*i + 4 - j][4*i + k] = derivativeCoeffs[k] * coeff_pot;
				M[4*i + 4 - j][4*i + k + 4] = -(derivativeCoeffs[k]) * coeff_pot;
			}
			b[4*i + 4 - j] = 0;
		}
	}
	//printMatrix(M);
	//console.log("b", b);
	
	var a = gaus2(M, b);
	
	return a;
}

/**
 *  Compute a polynomial via Horner-scheme.
 *  (last modification 29.9.16 Andreas)
 *  
 *  @param{Array}	coeffs		coefficients of the polynomial
 *  							(coeffs[0] + coeffs[1]*x + ...). 
 *  @param{Float}	x			the point to evaluate.
 *  
 *  @return{Float}	y			the value of the evaluation.
 *  
 */
function horner(coeffs, x){
	var y = coeffs[coeffs.length - 1];
	for(var i = coeffs.length - 1; i > 0; i--){
		y = x*y + coeffs[i - 1];
	}
	return y;
}

/**
 *  Makes a equidistant grid.
 *  (last modification 21.2.17 Simon)
 *  
 *  @param{double}	start		index value of interval
 *  @param{double}	end			last value of intervall
 *  @param{integer}	count		wanted number of values   
 * 
 *  @return{double[]}	x		grid
 *  
 */
function makeGrid(start,end,count){
		var x=new Array(count);
		var step=(end-start)/(x.length-1);
		for (var i=0; i < x.length; i++) {
		  x[i]=start+i*step;
		};
		return x;
	}

 
 
 /** @param{Array} 	array	the matrix of the linear system (Ax=b) to be solved.
 * 
 * @param{Array} 	array   the vector b
 * @return{Array} 	array   the vector x
 */
function gaus2(A, x) {

	rows=A.length;
	columns=A[0].length;
	
	if(rows!=x.length){
		return new Error('Wrong size of matrix or vector');
	}
    
    if(columns>rows){
    	return new Error('an linear equation system can not be unique solvable if you have more columns than rows');
    }
	
	// adds the x-Vector as last column    
    for (i=0; i < rows; i++) { 
        A[i].push(x[i]);
    }
    
	//iterate through all rows to get upper-triangular form and some zero lines
    for (i=0; i < columns; i++) { 
    	  	        
        // Search for maximum in this column
        //start with the diagonal element
        maxEl = Math.abs(A[i][i]);
        maxRow = i;
        //iterate through the rows and check if there is an bigger element
        for (k=i+1; k < rows; k++) { 
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (k=i; k < columns+1; k++) { 
            tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        if(Math.abs(A[i][i])<0.00000000000001){
    		console.log('LGS nicht eindeutig loesbar');
    		return new Error('LGS nicht eindeutig loesbar');
    	}
        
        // Make all rows below this one 0 in current column
        //k iterates through all rows 
        for (k=i+1; k < rows; k++) {	
            c = A[k][i]/A[i][i];
            //iterate throug all columns beginning at the not zero,diagonal element
            for (j=i; j < columns+1; j++) { 
                //if we are below the current diagonal-element -> set zero
                if (i==j) {
                    A[k][j] = 0;
                } else// subtract the line element from the current line element
                	{
                    A[k][j] -= c * A[i][j];
                }
            }
        }
        //console.log("Matrix nach step",i);
        //printMatrix(A);      
    }
	//At this point we should have an upper triangular matrix with (rows-columns) zero lines 
	//(maybe that the last lines are not exactly zero because of numerical mistakes. 
	// we will not pay attention to them anymore.)
	
	
    // Solve equation Ax=b for an upper triangular matrix A 
    x=new Array(columns);
    //set all x entries to zero
    for(var m=0; m<x.length;m++){
    	x[m]=0;
    }

    //iterate through the columns beginning at the last
    for (i=columns-1; i > -1; i--) { 
    	//divide the line through A[i][i]
    	if(Math.abs(A[i][i])<0.0000000001){
        	console.log('LGS nicht eindeutig loesbar');
        	return new Error('LGS nicht eindeutig loesbar');
    	}
    	
        x[i] = A[i][columns]/A[i][i];
        A[i][i]=1;
        
        //iterates through the lines above (same, fixed column) and subtracts the current line       
        for (k=i-1; k > -1; k--) { 
            A[k][columns] -= A[k][i] * x[i];
            //not necessary, but so we get a diagonal matrix.
            A[k][i]=0;
            
        }
        //console.log("Die Matrix nachdem eliminieren der i-ten Spalte mit i=",i);
        //printMatrix(A);
    }
    return x;
}

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
 * First delitates function-values with factor 2^-j and then translates it with k (usually integer)
 * @param {integer} j (2^-j) is delitation factor
 * @param {double} k translation
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


/** Compute the wavelet coefficients from the coefficients of the 
 *  corresponding refinement function.
 *  (last modification: 19.5.16 Andreas)
 *  
 *  @param{Array} a_tilde		the dual refinement coefficients.
 *  @param{int}	  a_tilde_start	the start index of the refinement coefficients.
 * 
 *  @return{Array} [b, b_start]	b		the wavelet coefficients,
 * 								b_start	the start index of the coefficients.
 */
function refCoeffstoWaveletCoeffs(a_tilde, a_tilde_start){
	var N = a_tilde.length - 1;
	var b = deepCopyVector(a_tilde);
	
	b.reverse();
	var b_start = 1 - N - a_tilde_start;
	for(var i = 0; i < b.length; i++){
		b[i] = b[i] * Math.pow((-1), b_start + i);
	}
	return [b, b_start];
}

/** Compute the wavelet coefficients from the coefficients of the 
 *  corresponding refinement function.
 *  (last modification: 18.5.16 Simon)
 *  
 *  @param{Array} a_tilde		the dual refinement coefficients.
 *  @param{int}	  a_tilde_start	the start index of the refinement coefficients.
 * 
 *  @return{Array} [b, b_start]	b		the wavelet coefficients,
 * 								b_start	the start index of the coefficients.
 */
// intuitiver aber es gibt noch einen Fehler
function refCoeffstoWaveletCoeffs2(a_tilde, a_tilde_start){
	var N = a_tilde.length - 1;
	var b = new Array(a_tilde.length);
	var b_start = 1 - N - a_tilde_start;
	
	for(var i = 0; i < a_tilde.length; i++){
		//console.log(a_tilde[1 - i - a_tilde_start - b_start]);
		b[i] = a_tilde[1 - i - a_tilde_start - b_start] * Math.pow((-1),
			b_start + i);
		}
	return [b, b_start];
}



