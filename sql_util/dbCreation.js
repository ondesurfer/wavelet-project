/** This file contains functions to create the wavelet database
 *
 *	(last modification: 8.7.16 Andreas)
 */

/**
 * Generate a sql-string for creating a row-entry
 * (last modification: 15.7.16 Andreas)
 * 
 * 	@param{String}  table name
 * 
 *	@param{int} 	ID
 * 	@param{String} 	name
 *  @param{String}	DOI
 * 	@param{String}	reference
 * 	@param{Array}	mask
 * 	@param{int}		a_start
 * 	@param{float}	critical Sobolev exponent
 * 	@param{float}	critical Hoelder exponent
 * 	@param{int}		exactness of polynomial approximation
 * 	@param{int}		ID of the dual function
 * 	@param{boolean}	orthogonal translations
 *  @param{int}		spline order (-1 if not a spline)
 *  @param{String}	comment
 *  @param{String}	symmetry
 * 
 * 	@return{String} the sql-string for row-creation	
 *  
 */
function genRowString(table_name, ID, name, DOI, reference, mask, a_start,
	critical_Sobolev_exponent, critical_Hoelder_exponent,
	exactness_of_poly_approx, ID_dual, orth_transl, spline_order, comment,
	symmetry){
	var a = [ID, name, DOI, reference, mask, a_start, critical_Sobolev_exponent,
	critical_Hoelder_exponent, exactness_of_poly_approx, ID_dual, orth_transl,
	spline_order, comment, symmetry];
	var sqlstr = "INSERT INTO " + table_name + " VALUES (" + a.toString() + ");";
	return sqlstr;    	
}


/**
 *  Generate a sql-string to generate a DB-entriey for a
 *  CDF-scaling-functions (CDF-SFs)
 *  (last modification: 22.7.16 Andreas)
 * 
 *  @param{int} ID
 *  @param{int} ID_primal	the ID of the primal Cardinal-BSpline-SF
 *  @param{int} m			the spline order of the primal Cardinal-BSpline-SF.
 *  @param{int}	mt			the approximation order.
 *  
 *  @return{String} sqlstr 	a string that contains all necessary sql-commands
 * 							to create a row-entry for a CDF-scaling-function.
 */

function genCDFString(table_name, ID, ID_primal, m, mt){
	var name = "\'(" + m + "," + mt + ")-CDF\'";
	var DOI = "NULL";
	var reference = "NULL";
	var a_t = genDualBSplineCoeffs(m,mt);
	var mask = "\'" + a_t[0].toString() + "\'";
	var a_start = a_t[1];
	var critical_Sobolev_exponent = 0;
	var critical_Hoelder_exponent = 0;
	var exactness_of_poly_approx = mt;
	var ID_dual =  "\'" + ID_primal + "\'";
	var orth_transl = 1;
	var spline_order = - 1;
	var comment = "NULL";
	var symmetry = "\'even\'";
	
	return genRowString(table_name, ID, name, DOI, reference, mask,
	a_start, critical_Sobolev_exponent, critical_Hoelder_exponent,
	exactness_of_poly_approx, ID_dual, orth_transl, spline_order, comment,
	symmetry);
}

/**
 *  Generate a sql-string to generate a DB-entriey with a
 *  Cardinal-BSpline-functions
 *  (last modification: 22.7.16 Andreas)
 * 
 *  @param{int} 	ID
 *  @param{Array}	ID_dual		list with IDs of the corresponding CDF-SFs.
 *  @param{int} 	m			the spline order.
 *  
 *  @return{String} sqlstr 	a string that contains all necessary sql-commands
 * 							to create a row-entry for a CDF-scaling-function.
 */

function genCardinalBSplineString(table_name, ID, ID_dual, m){
	var name = "\'(" + m + ")-BSpline\'";
	var DOI = "NULL";
	var reference = "NULL";
	var a_t = genBSplineCoeffs(i);
	var mask = "\'" + a_t[0].toString() + "\'";
	var a_start = a_t[1];
	var critical_Sobolev_exponent = 0;
	var critical_Hoelder_exponent = 0;
	var exactness_of_poly_approx = m - 1;
	ID_dual = "\'" + ID_dual.toString() + "\'";
	var orth_transl = 1;
	spline_order = m;
	var comment = "NULL";
	symmetry = "\'even\'";
	
	return genRowString(table_name, ID, name, DOI, reference, mask,
			a_start, critical_Sobolev_exponent, critical_Hoelder_exponent,
			exactness_of_poly_approx, ID_dual, orth_transl, spline_order, comment,
			symmetry);
}

/**
 *  Generate a sql-string to generate DB-entries with
 *  all Spline Scaling functions with order m =  1, ... , N and approximation order
 *  of their dual scaling function (CDF-SF)
 *  mt = 1, 3, 5, ... , (2M - 1) for m odd 
 *  mt = 2, 4, 6, ... , (2M) for m even
 *  in the following way:
 *  order_1_primal_scaling_function
 * 		approx_order_1_dual_scaling_function
 * 		approx_order_3_dual_scaling_function
 * 		...
 *  order_2_primal_scaling_function
 * 		approx_order_2_dual_scaling_function
 * 		approx_order_4_dual_scaling_function
 * 		...
 * 	...
 *  (last modification: 22.7.16 Andreas)
 * 
 *  @param{int} start_ID	the ID to start with.
 *  @param{int}	N			the maximal order of a generated spline-entry.
 * 	@param{int}	M			the number of entries with the dual functions. 
 * 
 *  @return{String} sqlstr 	a string that contains all necessary sql-commands
 * 							to create the row-entries for the BSpline-scaling-
 * 							functions and their dual functions.
 */
function genSplineScalingString(ID_start, N, M){
	var sqlstr ="";
	var ID = ID_start;
	var table_name = "\"ScalingFunctionsSupp\"";
	var ID_primal;
	for(var m=1; m < N + 1; m++){
		ID_primal = ID;
		ID_dual = onemtwom(ID + 1, M - 1, 1);
		sqlstr += genCardinalBSplineString(table_name, ID, ID_dual, m);
 		
		// mt >= m
		var mt = m;
		
		for(var j=0; j < M; j++){
			ID++;
			sqlstr += genCDFString(table_name, ID, ID_primal, m, mt);
			mt += 2;
		}
		
		ID++;
	}
	return sqlstr;
}

/**
 *  Generate a sql-string to generate DB-entries with
 *  all Daubechies Scaling functions with Daubechies-number 2, ... , 2N.
 *  (last modification: 15.7.16 Andreas)
 *  
 *  @param{int} start_ID	the ID to start with.
 *  @param{int}	N			the Daubechies-number.
 * 
 *  @return{String} sqlstr 	a string that contains all necessary sql-commands
 * 							to create the row-entries for the Daubechies-scaling-
 * 							functions and their dual functions.
 */
function genDaubechiesScalingString(ID_start, N){
	var sqlstr="";
	var ID = ID_start;
	var table_name = "\"ScalingFunctionsSupp\"";
	var name = "\'Daubechies\'";
	var DOI = "NULL";
	var reference = "NULL";
	var mask;
	var a_start = 0;
	var critical_Sobolev_exponent = 0;
	var critical_Hoelder_exponent = 0;
	var exactness_of_poly_approx = 0;
	var ID_dual = "NULL";
	var orth_transl = 1;
	var spline_order = -1;
	var comment = "NULL";
	var symmetry = "\'none\'";
	
	for(var i=1; i < N + 1; i ++){
		name = "\'(" + i + ")-Daubechies\'";
		// DOI = "NULL";
		// reference = "NULL";
		mask = "\'" + getDaubCoeffs(i).toString() + "\'";
		exactness_of_poly_approx =i;
		// critical_Sobolev_exponent = 0;
		// critical_Hoelder_exponent = 0;
		
		//create the primal scaling function entry
		sqlstr += genRowString(table_name, ID, name, DOI, reference, mask,
			a_start, critical_Sobolev_exponent, critical_Hoelder_exponent,
			exactness_of_poly_approx, ID_dual, orth_transl,
			spline_order, comment, symmetry);
		
		ID++;
	}
	return sqlstr;
}

/**
 *  Generate a sql-string to manually change a whole column of the db.
 *  (last modification: 15.7.16 Andreas)
 *  
 *  @param{String} column_name	the name of the column to change.
 *  @param{Array}  input		the input array (each entry corresponds to a
 *  							row).
 * 
 *  @return{String} sqlstr 	a string that contains all necessary sql-commands
 * 							to change a column to contain the given input.
 */

function changeColumn(column_name, input){
	// TODO
}