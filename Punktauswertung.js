/** Datei mit Funktionen zur Punktauswertung von Wavelets anhand ihrer Koeffizienten und vorgegebener Gitterweite
 *
 *	(Letzte Änderung: 12.4.16 Andreas)
 */

//Achtung: die calculateIntegerPointValues-Funktion liefert fuer den letzten ganzzahl-Wert derzeit nicht null, was sie aber sollte.

/** naive Funktion zur rekursiven Punktauswertung an den Punkten an denen das Wavelet nicht verschwindet (Achtung ineffizient!)
 *
 *	(Letzte Änderung: 22.3.16 Simon)
 *	@param{Array} ak Waveletkoeffizienten
 * 	@param{int} N 1/2hochN entspricht dem Abstand zwischen den Stuetzstellen
 * 	@return{Array} values Array einzelner Punkte in der Form [x,y]
 */
function naiveRekursivePunktauswertung(ak, N) {
	var solu = calculateIntegerPointValues(ak);
	//ausgabe von solu
	/*for(var i=0;i<solu.length;i++){
	 console.log("solu",i,solu[i]);
	 }*/
	function phi(j, l) {

		//Folgende Zeilen kuerzen den Bruch l/2^j so lange, bis er echt ist, denn eigentlich soll l ungerade sein.
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}
		if (l < 0) {
			return 0;
		}//wenn der x-Wert links vom kompakten Traeger liegt
		else if (Math.pow(2, -j) * l > ak.length - 1) {
			return 0;
		}//wenn der x-WERt rechts vom kompakten Traeger liegt
		else if (j == 0) {
			return solu[l];
		}//wenn der x-Wert ganzzahlig ist
		else {
			var p = 0;
			for (var k = 0; k < ak.length; k++) {
				p += ak[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			return p;
		}
	}

	var step = Math.pow(2, N);
	var width = ak.length - 1;
	var values = createArray(step * width + 1, 2);

	for (var i = 0; i < step * width + 1; i++) {
		values[i][0] = i * 1 / step;
		values[i][1] = phi(N, i);
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
function rekursivePunktauswertung(ak, N) {
	var solu = calculateIntegerPointValues(ak);
	var width = ak.length - 1;
	var step = Math.pow(2, N);
	var values = createArray(step * width + 1, 2);
	//trage bereits bekannte Eintraege in das Array values ein. - d.h. ganzzahl Werte
	for (var i = 0; i < width + 1; i++) {
		values[i*step][0] = i;
		values[i*step][1] = solu[i];
	}

	function phi(j, l) {//gibt phi an der Stelle l/2^j zurueck

		//Folgende Zeilen kuerzen den Bruch l/2^j so lange, bis er echt ist, denn eigentlich soll l ungerade sein.
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}

		var x = Math.pow(2, -j) * l;
		//der tatsaechliche x-Wert
		var index = step * x;
		//der Index in dem der x-Wert und gleich der zugehoerige Funktionswert gespeichert wird
		if (x < 0) {
			return 0;
		}//wenn der x-Wert links vom kompakten Traeger liegt
		else if (x > width) {
			return 0;
		}//wenn der x-WERt rechts vom kompakten Traeger liegt
		else if (values[index][0] != undefined) {
			return values[index][1];
		} else {
			var sum = 0;
			for (var k = 0; k < ak.length; k++) {
				sum += ak[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			values[index][0] = x;
			values[index][1] = sum;
			return sum;
		}
	}

	for (var i = 0; i < step * width + 1; i++) {
		phi(N, i);
	}

	return values;
}

/** Funktion zur rekursiven Punktauswertung an den Punkten, an denen das Wavelet nicht verschwindet.
 *
 *	(Letzte Änderung: 19.4.16 Simon)
 *	@param{Array} ak Waveletkoeffizienten
 * @param{Array} valuesOld bereits berechnete Funktionswerte, die weiter verfeinert bzw vergroebert werden sollen (Das Array muss das entsprechende Format haben!)
 * 	@param{real} linkerXwert, rechterXwert  Bereich, der berechnet bzw. geplottet werden soll.
 * 	@return{Array} values Array einzelner Punkte in der Form [x,y]
 */
function rekursivePunktauswertung2(ak, linkerXwert, rechterXwert, valuesOld) {
	//Traegerbreite
	var width = ak.length - 1;
	
	//Abstand zwischen den Stuetzstellen
	var delta=(rechterXwert-linkerXwert)/300;
	
	//neues N, step und werteArray fuer die neue Ebene
	var Nnew=Math.ceil(Math.log(1/delta)/Math.LN2);
	var stepNew = Math.pow(2, Nnew);
	var valuesNew = createArray(stepNew * width + 1, 2);
	// berechne altes N und altes step aus dem uebergebenen Array
	var stepOld=(valuesOld.length-1)/width;

	
	//falls verfeinert wird, d.h Nnew>Nold bzw. stepNew>stepOld
	if(stepNew>=stepOld){
		//kopiere alle Werte aus dem alten Array in das neue Array:
		var indexNew;
		for(var indexOld=0;indexOld<valuesOld.length;indexOld++){
			indexNew=stepNew*indexOld/stepOld; //sollte ganzzahlig sein...
			valuesNew[indexNew][0]=valuesOld[indexOld][0];
			valuesNew[indexNew][1]=valuesOld[indexOld][1];
		}
	}//falls vergroebert wird:
	else{
		var indexOld;
		for(var indexNew=0;indexNew<valuesNew.length;indexNew++){
			indexOld=stepOld*indexNew/stepNew; //sollte ganzzahlig sein...
			valuesNew[indexNew][0]=valuesOld[indexOld][0];
			valuesNew[indexNew][1]=valuesOld[indexOld][1];
		}
	}
		

	function phi(j, l) {//gibt phi an der Stelle l/2^j zurueck

		//Folgende Zeilen kuerzen den Bruch l/2^j so lange, bis er echt ist, denn eigentlich soll l ungerade sein.
		while (l % 2 == 0 && j > 0) {
			l = l / 2;
			j = j - 1;
		}
		//der tatsaechliche x-Wert
		var x = Math.pow(2, -j) * l;
		//der Index in dem der x-Wert und gleich der zugehoerige Funktionswert gespeichert wird		
		var index = stepNew * x;
		//wenn der x-Wert links vom kompakten Traeger liegt
		if (x < 0) {
			return 0;
		}//wenn der x-WERt rechts vom kompakten Traeger liegt
		else if (x > width) {
			return 0;
		}//wenn der Funktionswert bereits berechnet wurde und im Array liegt
		else if (valuesNew[index][0] != undefined) { 
			return valuesNew[index][1];
		}//Ansonsten rekursiver Funktionsaufruf 
		else {
			var sum = 0;
			for (var k = 0; k < ak.length; k++) {
				sum += ak[k] * phi(j - 1, l - Math.pow(2, j - 1) * k);
			}
			valuesNew[index][0] = x;
			valuesNew[index][1] = sum;
			return sum;
		}
	}
	// der index, ab dem die Werte fuer den (gezoomten) Plot benoetigt werden.
	//jeweils mit if-Abfrage, falls die Werte ausserhalb des kompakten Traegers liegen.
	var indexNewLinks = Math.floor(linkerXwert*stepNew);
	if(indexNewLinks<0){indexNewLinks=0;}
	
	var indexNewRechts = Math.ceil(rechterXwert*stepNew);
	if(indexNewRechts>=valuesNew.length){indexNewRechts=valuesNew.length-1;}
	
	//Berechnung der benoetigten Funktionswerte 
	for (var i = indexNewLinks; i <= indexNewRechts; i++) {
		//rufe phi auf, falls der Eintrag im neuen Array noch nicht besetzt ist.
		if(valuesNew[i][1]==undefined){	phi(Nnew, i);}
	}
	
	
	//das Array zurechtgeschnitten auf die benoetigten Werte
	var valuesNecessary=valuesNew.slice(indexNewLinks,indexNewRechts);
	
	//rueckgabe der neu berechneten Werte (meist einige Eintraege undefined), sowie der benoetigten Werte
	var result=[valuesNew,valuesNecessary];
	return result;
}

/** Funktion zur iterativen Punktauswertung
 *
 *	(Letzte Änderung: 12.4.16 Andreas)
 *	@param{Array} a Waveletkoeffizienten
 * 	@param{int} n 2hochN aequidistante Stuetzstellen
 *
 * 	@return{Array} values Array einzelner Punkte in der Form [x,y]
 */

function iterativePunktauswertung(a, N) {
	var sol = calculateIntegerPointValues(a);
	var step = Math.pow(2, N);
	//wird hier einmal berechnet, da staendig benoetigt
	var width = a.length - 1;
	//breite
	var values = createArray(width * step + 1, 2);

	//belege ganzzahlige Felder
	for (var i = 0; i < sol.length; i++) {
		values[i*step][1] = sol[i];
		values[i*step][0] = i;
	}

	//belege restliche Felder
	for (var j = 1; j < N + 1; j++) {

		//printMatrix(values);
		for (var l = 1; l < width * Math.pow(2, j); l += 2) {
			var k = 0;
			//index des ersten ak, welches benoetigt wird
			var index = Math.pow(2, N - j) * l;
			//dort kommt der neue Wert rein
			var index2 = index * 2;
			// das erste hintere Index aus dem die Werte fuer summe gebraucht werden

			//berechne den ersten index2 innerhalb des komp. Traegers
			if (index2 > step * width) {
				ft = Math.ceil(index2 / step) - width;
				index2 = index2 - ft * step;
				k = ft;
			}
			//hier werden die einzelnen Summanden draufaddiert
			values[index][1] = 0;

			//der x-Wert
			values[index][0] = index / step;
			
			//falls der index2 kleiner als 0 wird sind die funktionswerte nur 0 - die Reihe bricht ab.
			for (k; k < a.length && index2 >= 0; k++) {
					values[index][1] += a[k] * values[index2][1];
					index2 -= step;
			}
		}
	}
	//console.log("Die (iterativ berechneten) Funktionswerte lauten", values);
	return values;
}
