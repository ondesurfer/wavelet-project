/** Datei mit Funktionen zur Punktauswertung von Wavelets anhand ihrer Koeffizienten und vorgegebener Gitterweite
*    	
*	(Letzte Änderung: 1.4.16 Andreas)
*/ 

//Achtung: die calculateIntegerPointValues-Funktion liefert fuer den letzten ganzzahl-Wert derzeit nicht null, was sie aber sollte.

/** naive Funktion zur rekursiven Punktauswertung an den Punkten an denen das Wavelet nicht verschwindet (Achtung ineffizient!)
*    	
*	(Letzte Änderung: 22.3.16 Simon)
*	@param{Array} ak Waveletkoeffizienten 
* 	@param{int} N 1/2hochN entspricht dem Abstand zwischen den Stuetzstellen
* 	@return{Array} values Array einzelner Punkte in der Form [x,y]
*/ 
function naiveRekursivePunktauswertung(ak,N){
	var solu=calculateIntegerPointValues(ak);
	//ausgabe von solu
	/*for(var i=0;i<solu.length;i++){
		console.log("solu",i,solu[i]);
	}*/
	function phi(j,l){
		
		//Folgende Zeilen kuerzen den Bruch l/2^j so lange, bis er echt ist, denn eigentlich soll l ungerade sein.
		while(l%2==0&&j>0){
			l=l/2;
			j=j-1;
		}
		if(l < 0){ return 0;} //wenn der x-Wert links vom kompakten Traeger liegt
		else if(Math.pow(2,-j)*l > ak.length-1) {return 0;} //wenn der x-WERt rechts vom kompakten Traeger liegt
		else if(j==0){return solu[l];} //wenn der x-Wert ganzzahlig ist
		else{
			var p=0;
			for(var k=0;k<ak.length;k++){
				p+=ak[k]* phi(j-1,l-Math.pow(2,j-1)*k);				
			}
			return p;
		}
	}
	
	var step = Math.pow(2,N);
	var width = ak.length-1;
	var values = createArray(step*width+1,2); 
	
	for(var i=0;i<step*width+1;i++){
		values[i][0]=i*1/step;		
		values[i][1]=phi(N,i);
	}
	
	//console.log("Die naiv rekursiv berechneten Funktionswerte lauten", values);
	return values;
}

/** Funktion zur rekursiven Punktauswertung an den Punkten, an denen das Wavelet nicht verschwindet.
*    	
*	(Letzte Änderung: 22.3.16 Simon)
*	@param{Array} ak Waveletkoeffizienten 
* 	@param{int} N 1/(2hochN) entspricht dem Abstand zwischen den Stuetzstellen
* 	@return{Array} values Array einzelner Punkte in der Form [x,y]
*/ 
function rekursivePunktauswertung(ak,N){
	var solu=calculateIntegerPointValues(ak);
	var width = ak.length-1;
	var step = Math.pow(2,N);
	var values = createArray(step*width+1,2);
	//trage bereits bekannte Eintraege in das Array values ein. - d.h. ganzzahl Werte 
	for(var i=0;i<width+1;i++){
		values[i*step][0]=i;
		values[i*step][1]=solu[i];
	}
	
	function phi(j,l){ //gibt phi an der Stelle l/2^j zurueck 
		
		//Folgende Zeilen kuerzen den Bruch l/2^j so lange, bis er echt ist, denn eigentlich soll l ungerade sein.
		while(l%2==0&&j>0){
			l=l/2;
			j=j-1;
		}
		
		var x=Math.pow(2,-j)*l; //der tatsaechliche x-Wert
		var index=step*x;		//der Index in dem der x-Wert und gleich der zugehoerige Funktionswert gespeichert wird
		if(x < 0){ return 0;} //wenn der x-Wert links vom kompakten Traeger liegt
		else if(x>width) {return 0;} //wenn der x-WERt rechts vom kompakten Traeger liegt
		else if(values[index][0]!=undefined){return values[index][1];}
		else{
			var sum=0;
			for(var k=0;k<ak.length;k++){
				sum+=ak[k]* phi(j-1,l-Math.pow(2,j-1)*k);
			}
			values[index][0]=x;
			values[index][1]=sum;
			return sum;
		}
	}
	
	
	for(var i=0;i<step*width+1;i++){
		phi(N,i);
	}
	
	return values;
}

/** Funktion zur iterativen Punktauswertung 
*    	
*	(Letzte Änderung: 22.3.16 Simon)
*	@param{Array} a Waveletkoeffizienten 
* 	@param{int} n 2hochN aequidistante Stuetzstellen
* 
* 	@return{Array} vec Array einzelner Punkte in der Form [x,y]
*/ 


function iterativePunktauswertung(a,n){
	var sol=calculateIntegerPointValues(a);
	var step=Math.pow(2,n); //wird hier einmal berechnet, da staendig benoetigt
	var width=a.length-1; //breite 
	var Vec = createArray(width*step+1,2);

	
	//belege ganzzahlige Felder
	for(var i=0; i<sol.length; i++){
		Vec[i*step][1]=sol[i];
		Vec[i*step][0]=i;
	}

	//belege restliche Felder
	for(var j=1;j<n+1;j++){
		
		//printMatrix(Vec);
		for(var l=1;l<width*Math.pow(2,j);l+=2){ 
				var k=0; //index des ersten ak, welches benoetigt wird
				var index = Math.pow(2,n-j)*l; //dort kommt der neue Wert rein
				var index2 = index *2; // das erste hintere Index aus dem die Werte fuer summe gebraucht werden
				
				//berechne den ersten index2 innerhalb des komp. Traegers
				if(index2>step*width){
					ft=Math.ceil(index2/step)-width;
					index2= index2-ft*step;
					k=ft;
				} 
				
				Vec[index][1]=0;//hier werden die einzelnen Summanden draufaddiert
				Vec[index][0]=index/step; //der x-Wert
				
				for(k;k<a.length;k++){
					if(index2>=0){ //falls der index2 kleiner als 0 wird sind die funktionswerte nur 0 - die Reihe bricht ab.
						Vec[index][1]+=a[k]*Vec[index2][1];
						index2-=step;
					}
					else{
						break;
					}
				}
			}
	}
	//console.log("Die (iterativ berechneten) Funktionswerte lauten", vec);
	return Vec;	
}
