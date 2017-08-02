
	//berechnet in Abhaengigkeit des letzten Koeffizienten zl alle 4 neuen Koeffizienten,
	//und daraus die neue Werte, fuegt diese dem Plot hinzu und aktualisiert den Plot
	console.log('loaded');
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
		console.log("aktuelle Koeffizienten", coeffs);
		values = iterativePointEvaluation2(coeffs, 0, 11, 0);
		plotInst.options.data[0].points=values;
		plotInst.draw();
		return values;
	}
	
	
		
	//zl is the value of the fourth coefficient. 
	function plotDaubTrend(zl,mode,button,plotInst) {

		if(button.value=="run"){
			var timeout=window.setTimeout(function(){plotDaubTrend(zl,mode,button,plotInst);}, 100);
			return undefined;
		}
  		if (zl == undefined) {
    	// Startwert
    		zl = 0.5-Math.sqrt(2)/2;
  		}
  		
  		newValuesToPlot(zl,mode,plotInst);
	
		//Fortsetzungsbedingung-Bediungung
  		if (zl < (0.5+Math.sqrt(2)/2)) {
    		zl=zl+0.002;
   		 // Funktion um 100ms verzoegert aufrufen
    		var timeout = window.setTimeout(function(){plotDaubTrend(zl,mode,button,plotInst);}, 100);
    	}
	}
