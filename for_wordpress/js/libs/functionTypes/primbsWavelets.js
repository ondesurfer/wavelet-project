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
 *  (last modification: 03.6.17 Simon)
 * 
 * 	@param{int[]} [j,k] j level of scf, k number of scf (started at 0, counted from left to right)
 *   @param{int} params - [d] order of B-splines used for scf
 * 
 *   @return{double[][]} points points of the function as [[x0,f(x0)],[x1,f(y1)],...]
 */
	
	function valuesOfPrimalPrimbsScf(deliTrans,params){
		var j=deliTrans[0];
		var k=deliTrans[1];
		var d= params[0];
		//console.log("j",j,"k",k,"d",d);
		var scf=buildPrimalPrimbsScf(j,d);
		var grid = makeGrid(0,1,8192);
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
	 *	@param{double []} deliTrans [j,k] j level of wavelet - k number of wavelet (started at 0, counted from left to right)
	 *  @param{double []} params [j0,d,dTilde,Mj1]
	 * 								j0 smallest j which is possible
	 *								d order of B-splines used for scf	
	 *								dTilde dual-order
	 * 								Mj1 refinement matrix
	 * 
	 * 	@return{double[][]} values  calculated values
	 * 
	 */	
	function valuesOfPrimalPrimbsWav(deliTrans, params){
		
		
		var j=deliTrans[0];
		var k=deliTrans[1];
		
		var j0=params[0];
		var d=params[1];
		var dTilde=params[2];
		var Mj1=params[3];
		
		var scf=buildPrimalPrimbsScf(j+1,d); 
		var Mj1b = extendMj1(j,d,dTilde,Mj1,j0);	
		
		var params1 = [j,k,scf,Mj1b];
		var values1 = evaluateFunctionInGrid(evaluateSIWaveletInX,params1,0,1,5000);
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
	
/////////////////////////////////////////////
//// dual scaling functions /////////////////
/////////////////////////////////////////////	
	
/** Computes the dual left border scaling functions without border conditions as described by M.Primbs. See p.71.
 *  (last modification: 27.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual B-Spline
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{object[]} scf returns all scaling-function as an array of objects. 
 * 					Each object has the 'eval' and 'values' function to evaluate the scaling-function in x
 * 					Entries 0...d-3 are still undefined and reserved for the following functions.
 * 					Entries d-2...d+d_tilde-3 are the functions
 */
	function buildLeftDualPrimbsScfI(d,d_tilde){
		var m = d_tilde; //Number of border-functions see p.71
		var dscf = new Array(d+d_tilde-2); //Array for all left border-functions
		function Obj2(d, d_tilde, phiTilde, k) { 
    				return { 
    					d1 : d ,
    					d_tilde1 : d_tilde,
       				 	phiTilde1 : phiTilde,
       				 	k1 : k, 
       				 	
       				 	values: function(){return valuesOfLeftDualPrimbsScfI(d,d_tilde,k);},
        				eval : function(x){ return evaluateLeftDualPrimbsScfI(this.d1,this.d_tilde1,this.phiTilde1,this.k1,x); }, 
   					 }; 			
			};
		//calculate values of dual B-Spline function phiTilde - wenn wir nicht phiTildeuebergeben wuerden muessten wir jedes Mal alles rechnen.
		var coef =  genDualBSplineCoeffs(d, d_tilde);
		var phiTilde = iterativePointEvaluation2(coef[0], coef[1], 10, 0);
		//console.log("phiTilde",phiTilde);
		for(var k=d-1; k<d+d_tilde-1; k++){		
			dscf[k-1] = new Obj2(d,d_tilde,phiTilde,k);
		}	
		return dscf;	
	}
	

/** Evaluates Left border functions without border conditions as described by M.Primbs. See p.71.
 *	Values of one dual function phiTilde already must be given in an aequidistant grid.
 *  (last modification: 31.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual B-Spline
 *   @param{double[]} phiTilde values of the dual B-Spline which is used to construct the other ones
 * 	 @param{integer} k number of the searched border function, counted from left to right
 * 	 @param{double} x value, which function value is searched.
 * 
 *   @return{double} y  function value of the border function
 */
	function evaluateLeftDualPrimbsScfI(d, d_tilde, phiTilde, k,x) {
		var i=d+d_tilde-2-k;
	//calculate left and right support of dual B-Spline border function
		var l_1=-Math.floor(d/2)-d_tilde+1;
		var l_2=Math.ceil(d/2)+d_tilde-1;
		
		var y=0;
			//if x is not in support		
			if(x<0 || x> d+2*d_tilde-3-i ){
				return 0;
			}	
			else{
				//console.log("nochmal phiTilde", phiTilde);
				for(var n=i; n<l_2-l_1-1;n++){			
					y += nchoosek(n,i) * findValue(phiTilde, x + n + l_1 + 1);
				}
			}
		return y;
	}
	
	function valuesOfLeftDualPrimbsScfI(d, d_tilde,k) {
		var i=d+d_tilde-2-k;
		//generate coefficients of dual B-Spline functions
		var coef =  genDualBSplineCoeffs(d, d_tilde);
		//calculate values of dual B-Spline functions
		var values1 = iterativePointEvaluation2(coef[0], coef[1], 9, 0);
		var delta = values1[1][0]-values1[0][0];
		var supp = d+2*d_tilde-3-i; //see p.71
		
		//calculate left and right support of dual B-Spline function
		var l_1=-Math.floor(d/2)-d_tilde+1;
		var l_2=Math.ceil(d/2)+d_tilde-1;
		
		//initial new Array for new border-function values	
		var values2 = createArray(supp/delta + 1,2);
		for(var j=0;j<values2.length;j++){
			values2[j][0] = j*delta;
			values2[j][1] = 0;
			
			if(values2[j][0]<0){
				values2[j][1] =0;
				console.log("errror");
			}
			else{
				for(var n=i; n<l_2-l_1-1;n++){
					values2[j][1] += nchoosek(n,i) * findValue(values1,values2[j][0] + n + l_1 + 1);//hier richtiger Index...
				}
			}
		}
		console.log(values2);
		return values2;
}	
	
	
/** Computes the dual scaling functions for B-Splines as described by M.Primbs. See p.50. and CDF
 *  (last modification: 27.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual functions
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{object[]} scf returns all scaling-function as an array of objects. 
 * 						Each object has the 'values' function to calculate values of the scaling-function in
 */
	function buildMiddleDualPrimbsScf(d,d_tilde,j){
		var m = Math.pow(2,j)-d-2*d_tilde+3; //see p. 61
		var dmscf=new Array(m);
		//Object of a middle dual scaling function (from Primbs)
		function Obj3(d, d_tilde, k,j) { 
    				return { 
    					d1 : d ,
    					d_tilde1 : d_tilde,
       				 	k1 : k, 
       				 	j1 :j,
        				values : function(){ return valuesOfMiddleDualPrimbsScf(this.d1,this.d_tilde1,this.k1,this.j1);}, 
   					 }; 			
			};
			
		for(var k=0; k<m; k++){		
			dmscf[k] = new Obj3(d,d_tilde,k,j);
		}
		console.log("j6",j);
		return dmscf;
	}
	
/** Computes values of dual scaling of B-Splines as described by M.Primbs. See p.50. and CDF
 *  (last modification: 27.12.16 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual functions
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{double[]} returns all calculated values 
 */
	function valuesOfMiddleDualPrimbsScf(d,d_tilde,k,j2){
		var coef =  genDualBSplineCoeffs(d, d_tilde);
		var values = iterativePointEvaluation2(coef[0],0, 8, 0);
		
		//hier ersetzen mit deliAndTrans!
		//Translatierung um k (k=1...d+d_tilde-2)?
		//console.log(values);
		 for(var l=0; l<values.length; l++){
			values[l][0]=values[l][0]+k;
		}
		console.log(values);
		//Skalierung um 2 hoch -j
		for(var l=0; l<values.length; l++){
			values[l][0]=1/Math.pow(2,j2)*values[l][0];
		}
		console.log(values);
		return values;	
	}
			
/** Computes the dual left border scaling functions without border conditions as described by M.Primbs. See p.71.
 *  (last modification: 24.1.17 Simon)
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual B-Spline
 *   @param{int} j level for which the B-Splines are wanted
 * 
 *   @return{object[]} scf returns all left border scaling-function as an array of objects. 
 * 					Each object has the 'eval' function to evaluate the scaling-function in x
 */
	function buildLeftDualPrimbsScfII(d,d_tilde){
	
		function Obj4(d, d_tilde, phiL, k,M) { 
    				return { 
    					d1 : d ,
    					d_tilde1 : d_tilde,
       				 	phiL1 : phiL,
       				 	k1 : k, 
       				 	
        				eval : function(x){ 
        						var y=0;
        						for(var n=this.k1+1; n<=Math.min(d+2*k-1,d+d_tilde-2); n++){ //hier stimmt die hintere Grenze nicht ganz.
        							//console.log("n",n);
        							y+=M[n-1][k-1]*this.phiL1[n-1].eval(2*x);
        						}
        						return y;}, 
   					 }; 			
			};
		//build first part of left dual functions which also are necessary to 
		//to construct the rest of the left scaling functions
		var dscf=buildLeftDualPrimbsScfI(d,d_tilde);
		var M = m_LTilde(d,d_tilde);
		console.log("d1,dTilde",d,d_tilde);
		for(var k=d-2; k>0; k--){		
			console.log('dscf vor k=',k,"dscf",dscf);
			dscf[k-1]=new Obj4(d,d_tilde,dscf,k,M);
		}	
		return dscf;	
	}
	
/** Returns the hard-coded refinement matrices mTilde^L_n,k which are necessary
 *  to build left dual scaling functions as described by Primbs (see p. 84)
 *
 * 
 *   @param{int} d order of B-Spline
 *   @param{int} d_tilde order of dual B-Spline
 * 
 *   @return{double[]}  refinement matrix
 */
 
	function m_LTilde(d,dTilde){
		
		//for d=2 there are no border-functions which need the refinement matrix
		if(d==3 && dTilde==3){
			return [[0,0,0,0],[5,0.25,0,0],[-1,0.5,0.5,-4.1028059655e-016],[0.25,0.0625,1.25,1],[0,-0.28125,0.84375,0.90625],[0,0.09375,-0.03125,1.28125],[0,1.7763568394e-015,-0.28125,1.125],[0,-4.4408920985e-016,0.09375,-0.125],[0,-5.5511151231e-016,-7.7715611724e-016,-0.28125],[0,2.2204460493e-016,2.4980018054e-016,0.09375]];
		}
		if(d==3 && dTilde==5){
			return [[0,0,0,0,0,0],[7,0.0625,0,0,0,0],[-1,0.1875,0.125,0,0,0],[0.166666667,0.125,0.4375,0.25,0,0],[0,-0.0625,0.4375,1,0.5,0],[0,-0.0234375,0,1.3125,2.25,1],[0,0.05859375,-0.14453125,0.58203125,1.73046875,1.01953125],[0,-0.01953125,-0.00390625,0.00390625,1.30859375,0.94140625],[0,0,0.05859375,-0.203125,0.78515625,0.9453125],[0,0,-0.01953125,0.015625,-0.01171875,1.3203125],[0,0,0,0.05859375,-0.26171875,1.046875],[0,0,0,-0.01953125,0.03515625,-0.046875],[0,0,0,0,0.05859375,-0.3203125],[0,0,0,0,-0.01953125,0.0546875],[0,0,0,0,0,0.05859375],[0,0,0,0,0,-0.01953125]];
		}
		if(d==3 && dTilde==7){
			return [[0,0,0,0,0,0,0,0],[9,0.015625,9.82917768e-015,1.40054872e-014,1.29255162e-014,7.58620899e-015,2.57429818e-015,0],[-1,0.0625,0.03125,-4.12982681e-013,-4.96426398e-013,-3.42477897e-013,-1.27534849e-013,-1.84152984e-014],[0.125,0.07421875,0.140625,0.0625,-6.08348767e-013,-4.13161669e-013,-1.50017438e-013,-2.68056862e-014],[0,0.00390625,0.2109375,0.3125,0.125,4.62026391e-012,1.68174161e-012,2.65614499e-013],[0,-0.0283203125,0.08203125,0.5625,0.6875,0.25,7.09885795e-012,1.07764705e-012],[0,0.009765625,-0.052734375,0.375,1.4375,1.5,0.5,1.48911579e-012],[0,0.00610351561,-0.00878906256,-0.0234375001,1.3125,3.5625,3.25,1],[0,-0.0128173828,0.0286865234,-0.0902099611,0.441772461,2.30822754,2.75427246,0.995727539],[0,0.00427246093,0.00183105463,-0.0106201173,-0.012817383,1.32531738,2.23718262,1.01281738],[0,-8.98126018e-012,-0.0128173829,0.0415039061,-0.131713867,0.573486328,1.73474121,1.01953125],[0,-8.74855743e-012,0.00427246089,-0.00244140636,-0.00817871106,-0.00463867196,1.32995605,0.907226562],[0,-1.83320026e-012,-3.34954254e-011,-0.0128173829,0.054321289,-0.186035156,0.759521484,0.975219727],[0,1.29602995e-011,-1.08504196e-011,0.00427246088,-0.00671386727,-0.00146484381,-0.00317382814,1.33312988],[0,1.36992639e-011,2.91505936e-013,-3.38710347e-011,-0.0128173829,0.0671386718,-0.253173828,1.01269531],[0,-3.23741034e-013,-3.14319566e-013,-3.18382345e-014,0.00427246094,-0.0109863281,0.00952148437,-0.0126953125],[0,-4.3627324e-012,1.53772497e-013,1.14483502e-011,1.67019866e-011,-0.0128173828,0.0799560547,-0.333129883],[0,4.63629135e-013,3.14036161e-013,-3.42974056e-013,-6.91951281e-013,0.00427246094,-0.0152587891,0.0247802734],[0,1.05337961e-012,-3.65416681e-013,-3.70601444e-012,-5.21402736e-012,-3.45624662e-012,-0.0128173828,0.0927734375],[0,-2.45137244e-013,2.96789503e-014,7.0483254e-013,1.01661545e-012,6.71951138e-013,0.00427246094,-0.01953125],[0,-1.24122934e-013,1.05141237e-013,5.96985339e-013,8.12011971e-013,5.39994797e-013,1.81406292e-013,-0.0128173828],[0,4.11337631e-014,-3.50470791e-014,-1.98939602e-013,-2.7063365e-013,-1.7999364e-013,-6.04652946e-014,0.00427246094]];
		}
		if(d==3 && dTilde==9){
			return [[0,0,0,0,0,0,0,0,0,0],[11.0000029,0.00390625,3.73727843e-013,1.25997424e-012,2.32881369e-012,2.66737926e-012,1.95488839e-012,8.97550845e-013,2.36218445e-013,2.72872525e-014],[-1.00000063,0.01953125,0.0078125,-1.41727826e-012,-2.25427092e-012,-2.10580834e-012,-1.18366819e-012,-3.77841356e-013,-5.60968835e-014,-1.51258577e-015],[0.10000013,0.033203125,0.04296875,0.0156249999,-1.12060932e-010,-1.2297249e-010,-8.8038275e-011,-3.9937196e-011,-1.04606208e-011,-1.20855597e-012],[0,0.015625,0.0859374998,0.0937499993,0.0312499988,-1.38558486e-009,-1.01784431e-009,-4.70721056e-010,-1.25146932e-010,-1.46303094e-011],[0,-0.010498047,0.0644531245,0.214843748,0.203124997,0.0624999967,-2.45786499e-009,-1.14079858e-009,-3.04502931e-010,-3.57453248e-011],[0,-0.00415039067,-0.00537109412,0.214843749,0.523437498,0.437499997,0.124999998,-9.78151538e-010,-2.65010439e-010,-3.14954007e-011],[0,0.0061035149,-0.0187988336,0.05371092,0.644531218,1.24999996,0.937499972,0.249999987,-3.5524973e-009,-4.20289565e-010],[0,-0.00170898749,0.00805661708,-0.0429688257,0.322265486,1.81249984,2.93749988,1.99999994,0.499999985,-1.79047408e-009],[0,-0.00149536326,0.00268553117,-0.00268559916,-0.032226661,1.28906238,4.87499991,6.81249996,4.24999999,0.999999999],[0,0.00288391157,-0.00608825446,0.0168304503,-0.0624847323,0.352523812,2.7490387,5.06346131,3.7490387,1.0009613],[0,-0.000961301596,-0.000534042493,0.00321965153,-0.0059050668,-0.0263213151,1.31538398,3.55961612,3.25288392,0.99711609],[0,2.94767943e-009,0.00288393331,-0.00897209757,0.0258027404,-0.0882872068,0.440811266,2.30822759,2.75523378,0.993804933],[0,2.31091235e-009,-0.000961281893,0.000427319287,0.00279249456,-0.00869735228,-0.0176237847,1.33300787,2.22660829,1.02627564],[0,1.583075e-009,1.81609419e-008,0.00288397433,-0.0118559599,0.03765883,-0.125945942,0.56675725,1.74147035,1.01376343],[0,1.72221348e-009,1.50618674e-008,-0.000961253903,0.0013886421,0.00140391531,-0.0101012392,-0.00752254615,1.34053041,0.886077882],[0,-2.87792545e-009,-3.18767406e-009,5.7574028e-009,0.00288393294,-0.01473996,0.0523987052,-0.178344716,0.745101931,0.996368409],[0,-1.16167485e-008,-3.38327322e-008,-6.17157933e-008,-0.000961383839,0.00234977634,-0.000946098942,-0.0091552991,0.00163268313,1.3388977],[0,-1.06192601e-008,-3.27307648e-008,-6.37219898e-008,-8.77050549e-008,0.00288382344,-0.0176239636,0.0700225536,-0.248367318,0.993469237],[0,-7.84652343e-011,-2.92916351e-010,-6.77113521e-010,-1.05524928e-009,-0.00096130484,0.00331115641,-0.00425720253,-0.00489807139,0.00653076171],[0,3.6535539e-009,1.13252379e-008,2.21859172e-008,3.06944683e-008,3.07862121e-008,0.00288393299,-0.0205078022,0.0905303984,-0.338897705],[0,-1.05314868e-010,-3.67309082e-010,-8.05078626e-010,-1.21281251e-009,-1.27677044e-009,-0.000961304632,0.0042724605,-0.00852966321,0.00363159178],[0,-1.16544641e-009,-3.57636674e-009,-6.92781542e-009,-9.49436099e-009,-9.46751623e-009,-6.70832881e-009,0.00288390796,-0.0233917245,0.113922119],[0,1.59740665e-010,5.05816258e-010,1.01297893e-009,1.42695768e-009,1.44665344e-009,1.03086967e-009,-0.000961303224,0.00523376478,-0.0137634277],[0,2.49038123e-010,7.477265e-010,1.41374667e-009,1.89704346e-009,1.86690389e-009,1.31672898e-009,6.23852829e-010,0.00288391131,-0.0262756347],[0,-6.06990014e-011,-1.84131858e-010,-3.52290766e-010,-4.77658435e-010,-4.73149304e-010,-3.34470668e-010,-1.5834074e-010,-0.000961303756,0.00619506835],[0,-2.51096921e-011,-7.32426584e-011,-1.33826613e-010,-1.74023339e-010,-1.67795352e-010,-1.17493587e-010,-5.58114678e-011,-1.58756968e-011,0.00288391113],[0,8.36997138e-012,2.44130352e-011,4.46081309e-011,5.80079648e-011,5.5931747e-011,3.91645382e-011,1.86038226e-011,5.29189892e-012,-0.00096130371]];
		}
		if(d==4 && dTilde==4){
			return [[0,0,0,0,0],[0,0.125,0,0,0],[2,0.375,0.25,0,0],[-1.33333333,0.25,0.875,0.5,0],[0.6,-0.125,0.875,2,1],[-0.15,-0.1640625,0.2890625,1.4609375,1.0390625],[0,0.15625,-0.28125,1.15625,0.84375],
					[0,-0.0390625,-0.125,0.4140625,1.046875],[0,0,0.15625,-0.4375,1.59375],[0,0,-0.0390625,-0.0859375,0.5],[0,0,0,0.15625,-0.59375],[0,0,0,-0.0390625,-0.046875],[0,0,0,0,0.15625],[0,0,0,0,-0.0390625]];
		}
		if(d==4 && dTilde==6){
			return [[0,0,0,0,0,0,0],[0,0.03125,-3.61235901e-015,-3.91858639e-015,-2.23076728e-015,-6.28902698e-016,0],[2,0.125,0.0625,3.10950609e-014,2.46164878e-014,1.00745666e-014,1.42977577e-015],[-1,0.1484375,0.28125,0.125,3.95956046e-013,1.64149792e-013,2.8620252e-014],[0.321428572,0.0078125,0.421875,0.625,0.25,8.08598511e-013,1.33557466e-013],[-0.0535714287,-0.056640625,0.1640625,1.125,1.375,0.5,7.10412827e-013],[0,0.01953125,-0.10546875,0.75,2.875,3,1],[0,0.0378417969,-0.0749511718,0.133544922,1.74145508,2.50854492,0.991455078],[0,-0.0341796875,0.0537109376,-0.159179687,0.909179688,1.96582031,1.03417969],[0,0.00854492189,0.029296875,-0.104248047,0.237792969,1.50366211,1.00488281],[0,1.15121246e-011,-0.0341796875,0.087890625,-0.247070312,1.15625,0.809570313],[0,1.25268684e-011,0.00854492191,0.0207519532,-0.125,0.362792969,1.14086914],[0,1.44666501e-011,4.31050522e-011,-0.0341796874,0.122070313,-0.369140625,1.52539063],[0,4.65405492e-012,1.39667275e-011,0.00854492189,0.0122070313,-0.137207031,0.5],[0,-4.89563945e-012,-1.46020441e-011,-2.0341253e-011,-0.0341796875,0.15625,-0.525390625],[0,-1.40865097e-012,-4.22110769e-012,-5.91655677e-012,0.00854492187,0.00366210937,-0.140869141],[0,1.82964754e-012,5.4661135e-012,7.63827243e-012,5.74731708e-012,-0.0341796875,0.190429688],[0,-2.43138842e-014,-7.1471066e-014,-9.30304449e-014,-6.41321149e-014,0.00854492187,-0.0048828125],[0,-3.47277762e-013,-1.03675639e-012,-1.45336336e-012,-1.0980467e-012,-4.34460983e-013,-0.0341796875],[0,8.68194405e-014,2.59189098e-013,3.63340839e-013,2.74511676e-013,1.08615246e-013,0.00854492188]];
		}
		if(d==4 && dTilde==8){
			return [[0,0,0,0,0,0,0,0,0],[0,0.0078125,5.780248344e-014,1.592234549e-013,2.347699837e-013,2.068393592e-013,1.097323414e-013,3.252274573e-014,4.155440998e-015],[1.999999473,0.0390625,0.015625,5.846249955e-013,5.545418064e-013,3.320014419e-013,1.215888213e-013,2.456720337e-014,2.043920587e-015],[-0.7999995558,0.06640625,0.0859375,0.03125000001,1.197394495e-011,9.397695941e-012,4.561144515e-012,1.257180694e-012,1.510285131e-013],[0.1999997705,0.03125,0.171875,0.1875,0.06250000003,1.672760429e-011,6.829188766e-012,1.569334807e-012,1.544659856e-013],[-0.02499992745,-0.02099609374,0.12890625,0.4296875001,0.4062500001,0.125,1.597931603e-011,3.521623937e-012,3.227154503e-013],[0,-0.008300781386,-0.01074218815,0.4296874985,1.046874998,0.8749999983,0.2499999991,-2.508545386e-010,-3.1624617e-011],[0,0.01220702921,-0.03759766541,0.1074218545,1.289062473,2.499999978,1.874999989,0.4999999967,-4.087825487e-010],[0,-0.003417981427,0.01611322442,-0.08593762681,0.6445310822,3.624999862,5.87499993,3.99999998,0.9999999975],[0,-0.008758555702,0.01754755906,-0.03903209035,0.06051621461,1.873077275,4.251922548,3.498077375,1.001922605],[0,0.007690420663,-0.01110843893,0.0272215893,-0.1131592993,0.757690331,2.86730952,3.007690415,0.9923095685],[0,-0.001922614844,-0.006835970921,0.0243834702,-0.06341562632,0.1239318031,1.749145466,2.502777088,0.9953002915],[0,-6.005080877e-009,0.007690402251,-0.01879888988,0.04602042571,-0.1591797554,0.9168700826,1.950439443,1.057250975],[0,-4.659540309e-009,-0.001922628674,-0.00491337787,0.02929681148,-0.09271245489,0.2166442604,1.532501213,0.9702758779],[0,-3.388301195e-009,-1.530717896e-008,0.00769039541,-0.02648930326,0.07250972808,-0.2316894722,1.148559565,0.8018798821],[0,-2.620595296e-009,-1.373637952e-008,-0.00192264011,-0.002990767461,0.03228755988,-0.1250000195,0.3416442815,1.190856933],[0,-2.005208444e-009,-1.257944418e-008,-3.175082062e-008,0.007690384867,-0.03417972595,0.1066894331,-0.3383789121,1.486938476],[0,-5.896936273e-010,-3.898935554e-009,-9.987186229e-009,-0.001922621619,-0.001068127461,0.03335570651,-0.1583557148,0.4999999998],[0,5.899778444e-010,3.870725433e-009,9.892896833e-009,1.404762694e-008,0.007690441778,-0.04187011088,0.1485595722,-0.4869384763],[0,2.689404255e-010,1.642311885e-009,4.112232389e-009,5.78255163e-009,-0.001922602472,0.0008544947623,0.03250122146,-0.1908569335],[0,-2.547864142e-010,-1.620886436e-009,-4.106972397e-009,-5.808141994e-009,-4.987568624e-009,0.007690427088,-0.04956054764,0.1981201171],[0,-5.539213532e-011,-3.059936035e-010,-7.417412736e-010,-1.026420852e-009,-8.703475399e-010,-0.001922607872,0.002777099478,0.02972412108],[0,8.463274526e-011,5.083856917e-010,1.266514789e-009,1.776536715e-009,1.518391517e-009,7.891986833e-010,0.007690429918,-0.05725097653],[0,-4.542588528e-012,-3.250443545e-011,-8.496191406e-011,-1.219000266e-010,-1.05535115e-010,-5.529334147e-011,-0.001922607438,0.004699707029],[0,-1.329647503e-011,-7.567492225e-011,-1.853324495e-010,-2.577865669e-010,-2.19249967e-010,-1.136050191e-010,-3.311108924e-011,0.007690429683],[0,3.324118758e-012,1.891873056e-011,4.633311237e-011,6.444664171e-011,5.481249176e-011,2.840125477e-011,8.27777231e-012,-0.001922607421]];
		}
		if(d==5 && dTilde==5){
			return [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[4.5,0,0.0625,-3.5889277167e-015,-3.1332982568e-015,-1.3779118676e-015,-2.4450388776e-016],[-2,-4.3452380952,0.25,0.125,-1.9137986813e-014,-8.1997843067e-015,-1.4240118172e-015],[0.8125,6.1383928571,0.296875,0.5625,0.25,-1.6496667081e-014,-2.8334383213e-015],[-0.24107142857,-5.2306547619,0.015625,0.84375,1.25,0.5,5.6762812746e-014],[0.040178571429,3.2323554422,-0.11328125,0.328125,2.25,2.75,1],[0,-1.7704347364,-0.036621093749,-0.061035156247,1.2329101563,2.2670898438,0.98291015625],[0,0.35408694728,0.14404296875,-0.25732421875,0.58544921875,1.6645507813,1.0854492188],[0,0,-0.085449218749,0.048828125001,-0.10986328125,1.3427734375,0.92431640625],[0,0,0.01708984375,0.126953125,-0.38427734375,0.9697265625,0.69482421875],[0,0,-8.2422957348e-013,-0.085449218752,0.13427734375,-0.244140625,1.5869140625],[0,0,-9.6633812063e-013,0.017089843748,0.10986328125,-0.494140625,1.4638671875],[0,0,3.6237679524e-013,7.1214971896e-013,-0.085449218749,0.2197265625,-0.4638671875],[0,0,2.842170943e-013,6.2175933747e-013,0.017089843751,0.0927734375,-0.5869140625],[0,0,-1.8651746814e-013,-3.7555278865e-013,-3.5023796188e-013,-0.08544921875,0.30517578125],[0,0,-1.6431300764e-014,-3.6796675582e-014,-3.4519284916e-014,0.01708984375,0.07568359375],[0,0,3.1974423109e-014,6.9414664883e-014,6.5354298308e-014,3.0180359403e-014,-0.08544921875],[0,0,-6.5503158453e-015,-1.3827421825e-014,-1.3048655201e-014,-6.0499496684e-015,0.01708984375]];
		}
		if(d==5 && dTilde==7){
			return [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[5.5,0,0.015625,1.3214099e-014,3.7833119e-014,4.4787826e-014,2.8561668e-014,9.6614986e-015,1.3682204e-015],[-2,-6.4563492,0.078125,0.03125,1.2986193e-013,8.2140263e-014,3.1889688e-014,6.919023e-015,6.3659018e-016],[0.64999998,6.8107143,0.1328125,0.171875,0.0625,2.3809061e-012,1.331016e-012,4.1215203e-013,5.4688829e-014],[-0.14999999,-4.4040123,0.0625,0.34375,0.375,0.125,3.5611814e-012,1.0566152e-012,1.3577939e-013],[0.018749997,2.0186177,-0.041992187,0.2578125,0.859375,0.8125,0.25,9.5649855e-012,1.2916434e-012],[0,-0.62919265,-0.016601562,-0.021484375,0.859375,2.09375,1.75,0.5,6.0403174e-012],[0,0.10486544,0.024414063,-0.075195311,0.21484375,2.578125,5,3.75,1],[0,0,0.010681153,-0.0028686509,-0.093811033,1.1680298,3.5038452,3.2461548,1.0038452],[0,0,-0.032897949,0.057312013,-0.13250732,0.34735108,2.2307739,2.7692261,0.98077393],[0,0,0.019226075,-0.0085449206,0.0056762716,-0.099487303,1.2675171,2.2363281,1.0098267],[0,0,-0.0038452144,-0.029052733,0.086364748,-0.21887207,0.56622315,1.6645508,1.1046753],[0,0,3.2285818e-010,0.019226075,-0.027770995,0.033447267,-0.13293457,1.4004517,0.83587646],[0,0,2.7888802e-010,-0.003845214,-0.025207518,0.11157227,-0.33044434,0.89666748,0.7678833],[0,0,4.9760729e-010,2.0350622e-009,0.019226078,-0.046997067,0.080444338,-0.21337891,1.6138306],[0,0,4.0847681e-010,1.7396359e-009,-0.0038452117,-0.021362302,0.13293457,-0.46337891,1.3600464],[0,0,-1.0712142e-010,-4.6593305e-010,-8.4355866e-010,0.019226073,-0.066223145,0.14666748,-0.36004639],[0,0,-1.8641799e-010,-7.76152e-010,-1.3874717e-009,-0.0038452162,-0.017517091,0.15045166,-0.61383057],[0,0,6.933476e-011,2.9676377e-010,5.347866e-010,5.3628872e-010,0.019226075,-0.085449219,0.2321167],[0,0,5.095302e-011,2.0487699e-010,3.625647e-010,3.6044366e-010,-0.0038452146,-0.013671875,0.16412354],[0,0,-3.2056136e-011,-1.3161778e-010,-2.3434489e-010,-2.3367565e-010,-1.3602699e-010,0.019226074,-0.10467529],[0,0,-3.2542857e-012,-1.2008652e-011,-2.0673237e-011,-2.0277147e-011,-1.1689862e-011,-0.0038452148,-0.0098266602],[0,0,6.0458305e-012,2.3959822e-011,4.2214523e-011,4.188352e-011,2.4309732e-011,7.7493613e-012,0.019226074],[0,0,-1.2085888e-012,-4.7917646e-012,-8.4428158e-012,-8.3767151e-012,-4.8619103e-012,-1.5498709e-012,-0.0038452148]];
		}
		if(d==6 && dTilde==6){
			return [[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[-1.539728704,0,0,0,0,0,0,0,0],[0.60388287248,-14.203969209,0,0.03125,-2.161601069e-014,-2.0111953811e-014,-1.1192160325e-014,-3.4645607925e-015,-4.609991971e-016],[0.011366169772,13.62142976,6.3395371039,0.15625,0.0625,-2.4546515479e-013,-1.5984178481e-013,-5.5903275541e-014,-8.2098680627e-015],[-0.021016126206,-9.2893661209,-12.966592737,0.265625,0.34375,0.125,-5.8644220288e-013,-1.9059172768e-013,-2.6416476921e-014],[0.006626503242,4.9913940052,16.48654135,0.125,0.68750000001,0.75000000001,0.25,1.1425285713e-012,1.6065872493e-013],[-0.00082831297381,-2.0920406821,-15.553793168,-0.083984375002,0.51562499999,1.71875,1.625,0.5,-2.0317771123e-013],[0,0.62919275649,11.540890739,-0.033203125075,-0.042968750149,1.7187499998,4.1874999999,3.5,0.99999999999],[0,-0.10486545938,-10.320837763,0.027465820245,-0.14465332045,0.61730957016,2.8201904296,2.9923095703,1.0076904297],[0,0,4.3186402148,0.087158203059,-0.12036132825,0.077392577984,1.6413574218,2.5461425781,0.95385742187],[0,0,-0.71977336914,-0.10424804691,0.13171386711,-0.27636718759,0.89367675776,1.9265136719,1.0657958984],[0,0,0,0.046142578115,0.041015624966,-0.16137695317,0.23876953122,1.4025878906,1.1435546875],[0,0,0,-0.0076904297531,-0.096557617304,0.22827148426,-0.50463867195,1.3983154297,0.52819824218],[0,0,0,3.5953462429e-011,0.046142578174,-0.0051269530863,-0.15624999998,0.39501953125,1.0075683594],[0,0,0,1.9963408704e-010,-0.0076904293763,-0.088867187214,0.31713867203,-0.8217773437,2.2200927734],[0,0,0,3.7275071918e-011,5.7348842545e-011,0.046142578177,-0.051269531222,-0.10498046874,0.5],[0,0,0,-1.0439293874e-010,-1.6219225058e-010,-0.0076904298361,-0.081176757894,0.39831542966,-1.2200927734],[0,0,0,6.6080474426e-012,1.1277801367e-011,1.1134442156e-011,0.046142578131,-0.097412109373,-0.0075683593747],[0,0,0,3.4489744394e-011,5.2741114791e-011,4.7695960127e-011,-0.0076904296617,-0.073486328117,0.47180175781],[0,0,0,-1.2047252085e-011,-1.8693372842e-011,-1.7114128065e-011,-9.3717297061e-012,0.046142578122,-0.1435546875],[0,0,0,-3.705480367e-012,-5.4587592679e-012,-4.7708820288e-012,-2.4983487641e-012,-0.0076904296882,-0.065795898438],[0,0,0,2.9380942124e-012,4.4089404672e-012,3.9207120586e-012,2.0883845851e-012,6.18774522e-013,0.046142578125],[0,0,0,-4.8938630925e-013,-7.3489742607e-013,-6.5361854323e-013,-3.4803634194e-013,-1.0312677404e-013,-0.0076904296875]];
		}
		if(d==6 && dTilde==8){
			return [[0,0,0,0,0,0,0,0,0,0,0,0],[-5.3326047229,0,0,0,0,0,0,0,0,0,0,0],[-1.3720368933,2.1896269352,0,0,0,0,0,0,0,0,0,0],[-1.6946920924,-1.9123687755,4.812078726,0,0,0,0,0,0,0,0,0],[1.1015320164,-1.1866241628,-0.72374643147,-41.069755402,0.0078125000001,2.1327995218e-013,2.3637574354e-013,1.6016430023e-013,6.1965888905e-014,9.8395942574e-015,0,0],[-0.084730961787,0.65197075125,1.550227144,63.720284718,0.046874999999,0.015624999999,-1.3174448021e-012,-7.0094510589e-013,-1.0800971466e-013,8.6764765055e-014,4.3349233994e-014,5.4616672626e-015],[0.0070607050386,-0.19450393177,-1.356719099,-65.891835415,0.103515625,0.10156249998,0.031249999973,-3.0393244957e-011,-2.161222506e-011,-9.6608157811e-012,-2.4569778513e-012,-2.7021001774e-013],[0,0.038229012684,0.72291591275,53.186418148,0.08789062505,0.25390625015,0.21875000025,0.062500000266,1.84940068e-010,8.1258222828e-011,2.0518066106e-011,2.2712389287e-012],[0,-0.0038229011011,-0.26635860656,-34.856895929,-0.0058593744104,0.27929687664,0.6093750027,0.46875000283,0.12500000193,8.3810092029e-010,2.1003971352e-010,2.3279226135e-011],[0,0,0.064688998811,18.562018953,-0.035156247824,0.076171881171,0.81250001025,1.4375000109,1.0000000075,0.25000000325,8.1842340708e-010,9.0782226806e-011],[0,0,-0.0080861225681,-7.7677112663,0.011230475727,-0.076171855126,0.4316406581,2.2343750351,3.3437500242,2.1250000106,0.50000000267,2.965904655e-010],[0,0,0,2.3346252307,0.010253956014,-0.012695169725,-0.076171636083,1.6757815044,5.9062501759,7.687500077,4.5000000194,1.0000000022],[0,0,0,-0.38910420772,-0.0050735029428,0.026558049882,-0.1154248964,0.47089408724,3.4392625474,5.8107376787,4.0017624075,0.9982376118],[0,0,0,0,-0.020828206777,0.031082269538,-0.043777270704,-0.032394200921,1.7081758035,4.198074404,3.4894256751,1.0105743426],[0,0,0,0,0.024032629576,-0.029106034353,0.055664239724,-0.17108898349,0.64198316293,2.7972794151,3.0134582664,0.98830413979],[0,0,0,0,-0.010574307404,-0.010253810551,0.04133621953,-0.085113355196,0.052719233838,1.6554565944,2.5426178108,0.94680786277],[0,0,0,0,0.00176242166,0.022270298702,-0.051376176184,0.10704058711,-0.27812944952,0.92011266674,1.8771667625,1.1362915055],[0,0,0,0,2.8498561733e-008,-0.010574254729,0.00032058312446,0.041015786603,-0.12612903681,0.17884831693,1.4766082892,1.0660095229],[0,0,0,0,2.0570382731e-008,0.001762442818,0.020507894074,-0.071884073423,0.17892461448,-0.45705411554,1.3771667536,0.50000000062],[0,0,0,0,2.0514562493e-008,7.1697044992e-008,-0.010574207511,0.010894927491,0.030120960203,-0.15624994971,0.33509827955,1.1415100112],[0,0,0,0,2.4886958272e-008,1.0855670456e-007,0.00176261036,0.018745686225,-0.090629379514,0.26955423038,-0.72660825234,2.1037750271],[0,0,0,0,6.1318132794e-009,2.6025354975e-008,5.2305564907e-008,-0.010574278459,0.021469162889,0.008651755072,-0.16490172776,0.50000000063],[0,0,0,0,-1.3189037418e-008,-5.708237273e-008,-1.1549952138e-007,0.0017622519405,0.01698292855,-0.10761265808,0.37716673549,-1.1037750258],[0,0,0,0,-2.4168542723e-009,-8.6033348405e-009,-1.6129578437e-008,-1.8494306578e-008,-0.010574354313,0.032043450881,-0.023391725219,-0.14151000994],[0,0,0,0,6.4680989453e-009,2.6724891767e-008,5.3202509844e-008,6.3108013542e-008,0.0017624372205,0.015220663902,-0.12283324628,0.50000000063],[0,0,0,0,-6.080398407e-010,-3.0727530833e-009,-6.5206189014e-009,-7.9930029193e-009,-6.0870372663e-009,-0.010574343681,0.042617797103,-0.066009521567],[0,0,0,0,-1.9470576262e-009,-7.6282128132e-009,-1.4884376102e-008,-1.7462776989e-008,-1.2936291416e-008,0.0017623841741,0.013458250407,-0.13629150408],[0,0,0,0,7.1236883059e-010,2.8865658568e-009,5.7049281741e-009,6.7406925966e-009,5.0164316045e-009,2.3197453807e-009,-0.010574340218,0.053192138739],[0,0,0,0,1.9220536274e-010,7.0377705195e-010,1.3358284781e-009,1.5428184742e-009,1.1310975489e-009,5.1744651182e-010,0.0017623902704,0.011695861831],[0,0,0,0,-1.5990408997e-010,-6.0935566429e-010,-1.1759982489e-009,-1.3712249666e-009,-1.011686966e-009,-4.6495061019e-010,-1.2041378881e-010,-0.010574340834],[0,0,0,0,2.6651347795e-011,1.0156097972e-010,1.9599922706e-010,2.2853742041e-010,1.6861445732e-010,7.7491768365e-011,2.0068962488e-011,0.0017623901389]];
		}
		else{
			console.log("The refinement matrix m_L is not implemented for d=",d,"dTilde=",dTilde);
			return undefined;
		}
	}
	
	/** Calculates the values of a dual Primbs scalingfunction without Border conditions
 *  (last modification: 15.6.17 Simon)
 * 
 *   @param{int[]} deliTrans j level of scf k number of scf (started at 0, counted from left to right)
 *   @param{int[]} params params[0]=d order of B-splines used for scf
 * 							params[1]= dTilde
 * 
 *  left-left scf: k=0...d-3
 *  left scf	 : k=d-2...d+dTilde-3 //Anzahl: dTilde
 *  middle scf   : k=d+dTilde-2...2^j-dTilde
 *  right scf    : k=2^j-dTilde+1...2^j-dTilde+1+dTilde-1=2^j
 *  right-right scf: k= 2^j+1...2^j+d-3 
 *  
 * 
 *   @return{double[][]} points points of the function as [[x0,f(x0)],[x1,f(y1)],...]
 */
	function valuesOfDualPrimbsScf(deliTrans,params){
		
		var j=deliTrans[0];
		var k=deliTrans[1];
		var d=params[0];
		var dTilde=params[1];
		//console.log("d",d,"dTilde",dTilde,"k",k);
		//fuer die ganz linken Skalierungsfunktionen:
		if(k<d-2){
			var grid = makeGrid(0,(d+dTilde)/2+k,8192); //see Satz 4.12
			console.log("links links k=",k);
			var dscfI=buildLeftDualPrimbsScfII(d,dTilde);
			console.log("dscfI",dscfI);
			console.log("k",k,"dscfI",dscfI[k]);
			var values=evaluateObjectInGrid(dscfI[k],grid);
			
			var valuesNew = deliAndTrans(j,0,values);
			//console.log("valuesNew",valuesNew);
			return valuesNew;
		}
		//fuer die linken Skalierungsfunktionen neben der Mitte
		if(k<d+dTilde-2){
			console.log("links k=",k);
			return deliAndTrans(j,0,valuesOfLeftDualPrimbsScfI(d, dTilde,k+1));
		}
		//fuer die mittleren Skalierungsfunktionen
		if(k < Math.pow(2,j)-dTilde+1 ){
			return valuesOfMiddleDualPrimbsScf(d,dTilde,k-d-dTilde+2,j);
		}
		if(k < Math.pow(2,j)+1){
			var values = deliAndTrans(j,0,valuesOfLeftDualPrimbsScfI(d, dTilde,Math.pow(2,j)+d-1-k));
			return mirrorValues(values);
		}
		if(k < Math.pow(2,j)+d-1) {
			console.log("rechts-rechts k=", k);
			var grid = makeGrid(0,(d+dTilde)/2+(Math.pow(2,j)+d-3)-k,8192); //see Satz 4.12
			var dscf5=buildLeftDualPrimbsScfII(d,dTilde);
			var values = evaluateObjectInGrid(dscf5[Math.pow(2,j)+d-2-k],grid);
			var valuesNew = deliAndTrans(j,0,values); 
			return mirrorValues(valuesNew);
		}
		else{
			console.log("k=",k ," ist ungueltig");
			return undefined;
		}
		
	}
	
function mirrorValues(valuesOld){
	var le = valuesOld.length;
	var valuesNew = createArray(le,2);
	for(var l=0; l<le; l++){
		valuesNew[l][0]=1-valuesOld[le-1-l][0];
		valuesNew[l][1]=valuesOld[le-1-l][1];
	}
	return valuesNew;
}
	
	
/** For input function-values given in a aequidistant grid, this method finds the corresponding y-value of 
 *	the x-value. x values not given in the input values, are supposed to be 0
 * 
 *  (last modification: 23.1.16 Simon)
 * 
 *  @param{values}	   values 			input values (of the function)
 *  @param{double}		x				x, whose y-value is searched
 * 
 * 	@return{Array} 		y				y-value
 * 										
 */

function findValue(values,x){
		var delta = values[1][0]-values[0][0];
		var index = Math.round((x-values[0][0])/delta);
		if(index<0||index>=values.length){
			return 0;
		}
		if(Math.abs(values[index][0]-x)>delta){
			console.log("alles falsch");
			return undefined;
		}
		if(Math.abs(values[index][0]-x)>0.0001){
			//console.log("values approximated, error =", Math.abs(values[index][0]-x) );
		}
		if(index>=0&&index<values.length){
			return values[index][1];
		}
		else{
			//console.log("values out of definition-area were used");
			return 0;
		}
	}
		
	
	/** Evaluates a function in a Grid 
 * 
 *  (last modification: 15.6.16 Simon)
 * 
 *  @param{object}	func  function which will be evaluated
 *  @param{object[]} params params of the function
 *  @param{double}	start  start value of grid
 * 	@param{double}	end end-value of grid
 *  @param{int}		count number of grid-points
 * 
 * 	@return{double[]} 	points x and y-values
 * 										
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
	