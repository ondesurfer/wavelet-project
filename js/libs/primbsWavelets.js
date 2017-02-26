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
	
	
/////////////////////////////////////////////
//// primal wavelet /////////////////////////
/////////////////////////////////////////////
	function evaluateSIWaveletInX(j,k,scf,Mj1,x){
		var PsiInX=0;
		
		if(scf.length!=Mj1.length){
			console.log("scf-length",scf.length,"Mj1-length",Mj1.length);
			console.log("Matrix-vector dimension does not fit.");
			return null;
		}
		for(var i=0; i<scf.length; i++){
			PsiInX=PsiInX + Mj1[i][k]*scf[i].eval(x); 
		}
		return PsiInX;
	}
	
	/**calculates the values of a primal Primbs Wavelet without border conditions
	 *  (last modification 26.2.2017)
	 *	@param{int} j0 smallest j which is possible
	 *  @param{int} j level of wavelet
 	 *  @param{int} d order of B-splines used for scf
	 * 	@param{int} k number of wavelet (started at 0, counted from left to right)
	 *  @param{dTilde} dTilde dual-order
	 * 
	 * 	@return{double[][]} values calculated values
	 * 
	 */	
	function valuesOfPrimalPrimbsWav(j0,j,d,dTilde,Mj1,k){
		//console.log("starte funktion valuesOfPrimalPrimbsWav mit:");
		//console.log("j0=",j0,"j",j,"d",d,"dTilde",dTilde,"k",k);
		
		var scf=buildPrimalPrimbsScf(j+1,d); 
		console.log("Hier in values OfPrimalPrimbsWav gilt j0=",j0,"j=",j,"d=",d,"dTilde=",dTilde,"k=",k);
		var Mj1b = extendMj1(j,d,dTilde,Mj1,j0);	
		
		var params1 = [j,k,scf,Mj1b];
		var values1 = evaluateFunctionInGrid(evaluateSIWaveletInX,params1,0,1,1000);
		return values1;
		
	}
	
/** extendes the Mj1 Matrix of Primbs wavelets without border conditions
 *  (last modification: 24.2.17 Simon)
 * 
 *   @param{int} j wanted level of wavelets
 *   @param{int} d order of B-splines used for scf
 *   @param{int} dTilde dual order
 * 	@param{double[][]} Mj1 original matrix Mj1
 *  @param{int} j0 smallest possible level for this wavelt
 * 
 *   @return{double[][]} Mj1New extended Mj1-matrix
 */
	function extendMj1(j,d,dTilde,Mj1,j0){
		var linesOld = Math.pow(2,j0+1)+d-1;
		var columnsOld = Math.pow(2,j0);
		
		if(Mj1.length!=linesOld||Mj1[0].length!=columnsOld){
			console.log("wrong matrix dimensions");
			return undefined;
		}
		if(j0>j){
			console.log("j cannot be smaller than j0!");
			return undefined;
		}
		
		var linesNew = Math.pow(2,j+1)+d-1;
		var columnsNew = Math.pow(2,j);
		
		var Mj1New= createArray(linesNew,columnsNew);
		
		var Mj1Left= numeric.getBlock(Mj1,[0,0],[linesOld-1,columnsOld/2-1]);
		var Mj1Right = numeric.getBlock(Mj1,[0,columnsOld/2],[linesOld-1,columnsOld-1]);
		
		setBlock(Mj1New, Mj1Left, 0, 0);
		setBlock(Mj1New, Mj1Right, linesNew-linesOld, columnsNew-columnsOld/2);
		
		var leftColumn = numeric.getBlock(Mj1,[0,columnsOld/2-1],[linesOld-1,columnsOld/2-1]);
		var rightColumn = numeric.getBlock(Mj1,[0,columnsOld/2],[linesOld-1,columnsOld/2]);

		// insert column of left part into left part of new Matrix
		for(var k=0; k<(Math.pow(2,j)-Math.pow(2,j0))/2; k++){
			setBlock(Mj1New,leftColumn,2*(k+1),columnsOld/2+k);
		}
		// insert column of right part into right part of new Matrix
		for(var k=(Math.pow(2,j)-Math.pow(2,j0))/2; k<(Math.pow(2,j)-Math.pow(2,j0)); k++){
			setBlock(Mj1New,rightColumn,2*(k),columnsOld/2+k);
		}
		
		//fill up rest with zeros:
		for(var l=0; l<linesNew; l++){
			for(var k=0; k<columnsNew; k++){
				if(Mj1New[l][k]==undefined){
					Mj1New[l][k]=0;
				}
			}
		}
		
		//printMatrix("Mj1New",Mj1New);
		return Mj1New;		
	}
	
	
	
	
	// test of a general evaluation in grid function
	/*  Evaluate a function on grid points specified by [start, end, count]
		(last modification: 17.10.16 Andreas)
	*/
	function evaluateFunctionInGrid(funct,params,start,end,count){
		var x = makeGrid(start,end,count);
		var points = new Array(x.length);
		
		var params2 = deepCopyVector(params);
		params2.push(0); 
		
		for(var i=0; i< x.length; i++){
			params2[params2.length -1 ] = x[i];
			points[i]=[x[i], funct.apply(this, params2)];
		}
		return points;
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
	