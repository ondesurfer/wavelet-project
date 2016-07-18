/** This file contains functions to create the wavelet database
 *
 *	(last modification: 8.7.16 Andreas)
 */

/**
 * Generate a sql-string for creating a row-entry
 * 
 * 	@param{String}  table name
 * 
 *	@param{int} 	ID 		
 * 	@param{String} 	name
 *  @param{String}	DOI
 * 	@param{String}	reference
 * 	@param{Array}	mask
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
function genRowString(table_name, ID, name, DOI, reference, mask, critical_Sobolev_exponent,
	critical_Hoelder_exponent, exactness_of_poly_approx, ID_dual, orth_transl,
	spline_order, comment, symmetry){
	var a = [ID, name, DOI, reference, mask, critical_Sobolev_exponent,
	critical_Hoelder_exponent, exactness_of_poly_approx, ID_dual, orth_transl,
	spline_order, comment, symmetry];
	var sqlstr = "INSERT INTO " + table_name + " VALUES (" + a.toString() + ");";
	return sqlstr;    	
}

/**
 *  Generate a sql-string to generate DB-entries with
 *  all Spline Scaling functions with order m =  1, ... , N and approximation order
 *  of their dual scaling function
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
	var sqlstr="";
	var ID = ID_start;
	var table_name = "\"ScalingFunctionsSupp\"";
	var name = "\'BSpline\'";
	var DOI = "NULL";
	var reference = "NULL";
	var mask;
	var critical_Sobolev_exponent = 0;
	var critical_Hoelder_exponent = 0;
	var exactness_of_poly_approx = "NULL";
	var ID_dual;
	var orth_transl = 1;
	var spline_order;
	var comment = "NULL";
	var symmetry;
	
	var ID_primal;
	for(var i=1; i < N + 1; i++){
		ID_primal = ID;
		name = "\'(" + i + ")-Daubechies\'";
		// DOI = "NULL";
		// reference = "NULL";
		mask = "\'" + genBSplineCoeffs(i)[0].toString() + "\'";
		// critical_Sobolev_exponent = 0;
		// critical_Hoelder_exponent = 0;
		exactness_of_poly_approx = "NULL";
		ID_dual = onemtwom(ID + 1, M - 1, 1);
		ID_dual = "\'" + ID_dual.toString() + "\'";
		spline_order = i;
		symmetry = "\'even\'";
		//create the primal scaling function entry
		sqlstr += genRowString(table_name, ID, name, DOI, reference, mask,
			critical_Sobolev_exponent, critical_Hoelder_exponent,
			exactness_of_poly_approx, ID_dual, orth_transl,
			spline_order, comment, symmetry);
 		
		var j = 1;
		if(i % 2 == 0){
			j++;
		}
		
		for(j; j < 2*M + 1; j += 2){
			ID++;
			name = "\'(" + i + "," + j + ")-dual-BSpline\'";
			mask = "\'" + genDualBSplineCoeffs(i,j).toString() + "\'";
			exactness_of_poly_approx = j;
			ID_dual =  "\'" + ID_primal + "\'";
			//orth_transl = true;
			spline_order = i;
			comment = "NULL";
			symmetry = "\'even\'";
			sqlstr += genRowString(table_name, ID, name, DOI, reference, mask,
			critical_Sobolev_exponent, critical_Hoelder_exponent,
			exactness_of_poly_approx, ID_dual, orth_transl,
			spline_order, comment, symmetry);
		}
		
		ID++;
	}
	return sqlstr;
}

/**
 *  Generate a sql-string to generate DB-entries with
 *  all Daubechies Scaling functions with Daubechies-number 2, ... , 2N.
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
	var critical_Sobolev_exponent = 0;
	var critical_Hoelder_exponent = 0;
	var exactness_of_poly_approx = "NULL";
	var ID_dual = "NULL";
	var orth_transl = 1;
	var spline_order = -1;
	var comment = "NULL";
	var symmetry = "\'none\'";
	
	for(var i=1; i < N + 1; i ++){
		name = "\'(" + 2*i + ")-Daubechies\'";
		// DOI = "NULL";
		// reference = "NULL";
		mask = "\'" + getDaubCoeffs(i).toString() + "\'";
		// critical_Sobolev_exponent = 0;
		// critical_Hoelder_exponent = 0;
		
		//create the primal scaling function entry
		sqlstr += genRowString(table_name, ID, name, DOI, reference, mask,
			critical_Sobolev_exponent, critical_Hoelder_exponent,
			exactness_of_poly_approx, ID_dual, orth_transl,
			spline_order, comment, symmetry);
		
		ID++;
	}
	return sqlstr;
}
