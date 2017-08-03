
/** calculates all mask-coefficients in dependency of the last coefficient. 
 * then calculates all values and plots them. 
 *
 *  @param{double} zl - last coefficient 
 * 	@param{int} mode - number of solution branch
 * 	@param{plot} plotInst - plot instance where new values are plotted
 */
	function newValuesToPlot(zl,mode,plotInst){
		var z = zl;
		var sigma = 0.5*Math.sqrt(-4*zl*zl+4*zl+1);
		var x = 1-zl;
		//first branch of solution
		if(mode==1){
			var w = sigma+0.5;		
			var y = 0.5-sigma;
		}
		//second branch of solution
		else if(mode==2){
			var w = 0.5-sigma;
			var y = sigma + 0.5;
		}
		var coeffs=[w,x,y,z];
		values = iterativePointEvaluation2(coeffs, 0, 11, 0);
		plotInst.options.data[0].points=values;
		plotInst.draw();
		return values;
	}
	
	

/** generates a small video of the trend of all refinable-functions with am mask of 4 coefficients.
 * they solve the non-linear system for refinable, orthonormal functions
 *  @param{double} zl - last coefficient 
 * 	@param{int} mode - number of solution branch
 * 	@button{button} button - button with values "run" and  "stop"
 *  @button{button} button - button with values "run" and  "stop"
 * 	@param{plot} plotInst - plot instance where new values are plotted
 */
	function plotDaubTrend(zl,mode,button,buttonReset,plotInst,step) {
		buttonReset.onclick = function() {
			zl=0.5-Math.sqrt(2)/2;
			newValuesToPlot(zl+step,mode,plotInst);
		};
		//initializing in first call
		if (zl == undefined) {
    		buttonReset.click();
  		}
  		//if button shows 'run' - video is paused
		if(button.value=="run"){
			var timeout=window.setTimeout(function(){plotDaubTrend(zl,mode,button,buttonReset,plotInst,step);}, 100);
			return undefined;
		}
  		  		
  		newValuesToPlot(zl,mode,plotInst);
	
		//requirement to continue
  		if (zl < (0.5+Math.sqrt(2)/2-step)) {
    		zl=zl+step;
   		//invoke function 100ms later
    		var timeout = window.setTimeout(function(){plotDaubTrend(zl,mode,button,buttonReset,plotInst,step);}, 100);
    	}
	}
