	/////////////////////////////////////////////
	//// primal scaling functions ///////////////
	/////////////////////////////////////////////
	/** Computes the primal scaling functions as described by M.Primbs. See p.50.
 *  (last modification: 22.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{object[]} scf returns all scaling-function as an array of objects. 
 * 						Each object has the 'eval' function to evaluate the scaling-function in x
 */
	function buildPrimalPrimbsScf(j,d){
		var m = Math.pow(2,j)+d-1; //Number of scaling-functions
		var nodes = buildNodeGridForBSpline(d,j);
		var scf = new Array(m);
		//Object of a primal Primbs scaling-function
		function Obj( prop1, prop2, prop3 ) { 
    				return { 
       				 	d1 : prop1,
       				 	nodes1 : prop2,
       				 	k1 : prop3, 
        				eval : function(x){ return evaluateBSplineInPointX(this.d1,this.nodes1,this.k1+1,x); }, 
   					 }; 			
			};
			
		for(var k=0; k<m; k++){	
			scf[k] = new Obj(d,nodes,k);
		}
		console.log(scf);
		return scf;
	}
	
/** Calculates the values of a primal Primbs scalingfunction without Border conditions
 *  (last modification: 21.2.17 Simon)
 * 
 *   @param{int} j level of scf
 *   @param{int} d order of B-splines used for scf
 * 	@param{int} k number of scf (started at 0, counted from left to right)
 * 
 *   @return{double[][]} points points of the function as [[x0,f(x0)],[x1,f(y1)],...]
 */
	
	function valuesOfPrimalPrimbsScf(j,d,k){
		var scf=buildPrimalPrimbsScf(j,d);
		var grid = makeGrid(0,1,1000);
		var values = evaluateObjectInGrid(scf[k],grid);
		
		return values;
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/** Evaluates a function, given as an object with the function 'eval', in a grid
 *  (last modification: 22.12.16 Simon)
 * 
 *   @param{double[]} grid grid,where the function shall be evaluated
 *   @param{object} obj function, given as an object, which shall be evaluated
 * 
 *   @return{double[][]} points points of the function as [[x0,f(x0)],[x1,f(y1)],...]
 */
	function evaluateObjectInGrid(obj,grid){
		var points = new Array(grid.length);	
		for(var j=0; j<grid.length; j++){
			points[j]=[grid[j], obj.eval(grid[j])];
		}
		return points;
	}
	