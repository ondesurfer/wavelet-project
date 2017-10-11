	/** Computes the node grid to constuct the BSplines for an intervall as primal scaling-functions as described by M.Primbs. See p.50.
 *  (last modification: 22.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{int} grid grid which later will be used to construct the B-Splines.
 */
	function buildNodeGridForBSpline(d,j){
		var grid = new Array();
		for(var k=0;k<d;k++){
			grid.push(0);
		}
		for(var k=1; k<Math.pow(2,j); k++){
			grid.push(Math.pow(2,-j)*k);
		}
		for(var k=0; k<d; k++){
			grid.push(1);
		}
		//console.log("Das Gitter fuer die BSplines:", grid);
		return grid;
	}
	
/** Computes the node grid as [0,0...,0,1,2,...]. It can be used 
 * to build BSplines for j=0 with just left side boarder-functions and
 * to calculate B_1,B_2 Matrices. For more details see [Pr] p.56
 *
 *  (last modification: 22.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 * 
 *   @return{int} grid grid which later will be used to construct the B-Splines.
 */
	function buildNodeGridForBSpline2(d){
		var grid = new Array();
		for(var k=0;k<d;k++){
			grid.push(0);
		}
		for(var k=1; k<2*d+1; k++){
			grid.push(k);
		}
		return grid;
	}

	/** evaluates B-Spline N_{d,k} with the knots t at the point x.
 *  (last modification: 22.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} t grid of B-Spline
 * 	@param{int} k number of B-Spline (counted from left to right started at k=0)
 *  @param{double} x x-value where the BSpline will be evaluated
 * 
 *   @return{double} y y-value of BSpline at x
 */	
	function evaluateBSplineInPointX(d,t,k,x){
		if(d==1){
			if(t[k-1]<=x&& x<=t[k]){
				return 1;
			}else{
				return 0;
			}			
		}
		else{
			var y=0;
			var diff=t[k+d-2]-t[k-1]; 
			if(diff>0){
				y=(x-t[k-1])*evaluateBSplineInPointX(d-1,t,k,x)/diff;
			}
			diff=t[k+d-1]-t[k];
			if(diff>0){
				y=y+(t[k+d-1]-x)*evaluateBSplineInPointX(d-1,t,k+1,x)/diff;
			}
		}
		return y;
	}

/** evaluates B-Spline N_{d,k} with the knots t at the point x.
 *  (last modification: 21.02.17 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} t grid of B-Spline
 * 	@param{int} k number of B-Spline (counted from left to right started at k=0)
 * 	@param{int} r number of derivative
 *  @param{double} x x-value where the BSpline will be evaluated
 * 
 *   @return{double} y y-value of BSpline at x
 */		
function evaluateRthDerivOfBSplineInPointX(d,t,k,r,x){
		//return 0 if the order of derivate is bigger than the spline-order
		if(d<r+1){
			return 0;
		}
		
		//if just the point-evaluation (without derivation) is searched
		if(r==0){
			return evaluateBSplineInPointX(d,t,k,x);
		}
		
		else{
			var y=0;
			var diff=t[k+d-2]-t[k-1];
			if(diff>0){
				y=(d-1)*evaluateRthDerivOfBSplineInPointX(d-1,t,k,r-1,x)/diff;
			}
			diff=t[k+d-1]-t[k];
			if(diff>0){
				y=y-(d-1)*evaluateRthDerivOfBSplineInPointX(d-1,t,k+1,r-1,x)/diff;
			}
		}
		return y;
	}