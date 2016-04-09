//leicht veraendert

/** sucht pivot-Elemente der Matrix a
 * @param{Array} A Matrix des spaeter zu loesendem Systems
 * @return{Array} pivot Vektor mit Indices der zu waehlenden Zeilen
 */
    function pivot(matrix){
    	var A = deepCopyMatrix(matrix);
        var n = A.length;
        var pivotA = new Array(n);
        for (j = 0; j < n-1; j++){
            max = Math.abs(A[j][j]);
            imax = j;
            for (i = j+1; i < n; i++){
                if (Math.abs(A[i][j]) > max)
                {
                    max  = Math.abs(A[i][j]);
                    imax = i;
                }
            }
          	h = A[j];
            A[j] = A[imax];
            A[imax] = h;
            pivot[j] = imax;
            for (i = j+1; i < n; i++){
                f = -A[i][j]/A[j][j];
                for (k = j+1; k < n; k++)
                    A[i][k] += f*A[j][k];
                A[i][j] = -f;
            }
        }
        return pivotA;
    }
    
/** Funktion zum Loesen eines quadratischen LGS mit Pivotelementsuche
 * @param{Array} A Matrix des LGS Ax=b
 * @param{Array} b Vektor des LGS Ax=b
 * @return{Array} x Loesungsvektor
 */
    function solve(Matr, Vect)
    {
        A=deepCopyMatrix(Matr);
        b=deepCopyVector(Vect);
        B = A; //urspr. A.clone
        x = b;//urspr. b.clone
        var pivotA = pivot(B);
        n = B.length;
        for (i = 0; i < n-1; i++){
            h = b[pivot[i]];
            b[pivotA[i]] = b[i];
            b[i] = h;
        }
        for (j = 0; j < n; j++)
        {
            x[j] = b[j];
            for (i = 0; i < j; i++)
                x[j] -= B[j][i]*x[i];
        }
        for (j = n-1; j >= 0; j--)
        {
            for (k = j+1; k < n; k++)
                x[j] -= B[j][k]*x[k];
            x[j] /= B[j][j];
        }
        return x;
	}
	
	function deepCopyMatrix(matrix){
		var newMatrix = createArray(matrix.length,matrix[0].length);
		for(var z=0;z<newMatrix.length;z++){
			for(var s=0; s<newMatrix[0].length;s++){
				newMatrix[z][s]=matrix[z][s];
			}
		}
		return newMatrix;
	}
	
	function deepCopyVector(vector){
		var newVector = new Array(vector.length);
		for(var i =0; i<newVector.length;i++){
			newVector[i]=vector[i];
		}
		return newVector;
	}
	
	/** Funktion um die Koeffizienten a_k eines Wavelets in die Matrix einzusortieren
	 * @param{Array} a Koeffizienten im Array
	 * @return{Array} mat Matrix mit einsortierten Koeffizienten
	*/
	function coeffsToMatrix(akk){
		var a=new Array();
		//kopiere akk zu a, da  wir sonst akk zerstoeren
		for(var i=0; i<akk.length; i++){
			a[i]=akk[i];
		}
		N=a.length; //Anzahl der Koeffizienten die Randkoeffizienten müssen  von 0 verschieden sein - ggf. Abfrage noch notwendig
		//haenge N-4 Nullen vorne und hinten an den Koeffizientenvektor - macht es später einfacher!
		for(i=0;i<N-4;i++){
			a.push(0);}
		for(i=0;i<N-4;i++){
			a.unshift(0);}
			
		mat=createArray(N-2,N-2);
		//first Index ist der Index, ab dem (von rechts nach links gelaufen) die Elemente in die Zeile aufgenommen werden;
		firstIndex=1+N-4;
		for(z=0;z<N-2;z++){
			marker=firstIndex;
			for(s=0;s<N-2;s++){
				mat[z][s]=a[marker];
				marker--;
			}
			firstIndex+=2;
		}
		//ziehe je 1 auf den Diagonalen ab (denn spaeter 0=(A-Id)v)
		for(var i=0;i<N-2;i++){
			mat[i][i]= mat [i][i]-1;
		}
		return mat;
	}

	/** Funktion zur Konsolen-Ausgabe eines zweidimensionalen nxm Arrays
	 * (Letzte Änderung: 28.2.16 Simon)
	 * @param{Array} Mat Matrix die Ausgegeben werden soll.
	 * @return{undefined}
	 */
	function printMatrix(Mat){
		for(z=0;z<Mat.length;z++){
			asString = new String(" ");
			//haengt alle Zahlen einer Zeile zum String zusammen
			for(s=0;s<Mat[0].length;s++){
				asString=asString+ " " + Mat[z][s];
			}
			//gibt den zusammengehaengten String aus und eine weitere Leerzeile
			console.log(asString);
			console.log(" ");
		}
		
	}

/** Funktion zum Erstellen von Arrays beliebiger Dimension 
*     (z.B.: (2,3)-erstellt eine 2x3 Matrix; (2,2,2) erstellt eine 3 dimensionale 2x2x2 'Matrix')	
*	(Letzte Änderung: 28.2.16 Simon)
*	@param{int,int..} length. 
* 	@return{Array} arr
*/ 
/*function createArray(length) {
    var arrr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arrr[length-1 - i] = createArray.apply(this, args);
    }

    return arrr;
}*/
  
function createArray(length1, length2){
	var array=new Array(length1);
	for(var i=0;i<length1;i++){
		array[i]=new Array(length2);
	}
	
	//printMatrix(array);
	return array;
}

/** Funktion zum ueberpruefen ob die Koeffizienten ein Daubechies-Wavelet erzeugen koennten
* Prueft ob die Summe 2 ergibt, die Summe der Quadrate 2 ergibt und ob sum(a(l)*a(l-2k))=0 fuer festes k.
* *	(Letzte Änderung: 9.4.16 Simon)
*	@param{Array} a zu ueberpruefendeKoeffizienten
* 	@param{int} n 10 hoch(-n) gibt die Fehlertoleranz an.
* 	@return{Array} boolean
*/ 
function testCoeffs(a,n){
	
	var fehlertoleranz=Math.pow(10,-n); 
	
	var sum1=0; //Summe der Koeffizienten soll 2 sein
	var sum2=0; //Summe der Quadrate der Koeffizienten soll 2 sein
	for(var i=0;i<a.length;i++){
		sum1+=a[i];
		sum2+=(a[i]*a[i]);
	}
	
	//console.log(sum1);
	//console.log(sum2);
	if(Math.abs(sum1-2.0)>fehlertoleranz){return false;}
	if(Math.abs(sum2-2.0)>fehlertoleranz){return false;}
	
	//Summe ueber a_l*a_(l-2k) soll 0 sein fuer alle k!=0
	var sum3;
	for(var k=1;k<=(a.length-1)/2;k++){
		sum3=0;
		for(var l=0;l<a.length;l++){
			if((l-2*k)>=0){
				sum3+=a[l]*a[l-2*k];
			}
		}
		//console.log(sum3);
		if(Math.abs(sum3)>fehlertoleranz){return false;}
	}
	return true;
}

/** berechnet die Funktionswerte des Wavelets an den ganzzahligen Stellen durch Aufstellen und Lösen eines LGS
*	(Letzte Änderung: 1.3.16 Simon)
*	@param{Array} a Wavelet-Koeffizienten. 
* 	@return{Array} sol Funktionswerte an den ganzzahligen Stellen inklusive 0 und dem "Ende des kompakten Traegers".
*/ 
function calculateIntegerPointValues(a){
	var mat= coeffsToMatrix(a);
	//document.write("die Matrix fuer das LGS: ");
	//document.write(mat);
	//console.log("die Matrix fuer das LGS:");
	//printMatrix(mat);
	//fuegt die letzte Zeile aus Einsen an die Matrix an ('Normierungsbedingung')
	var s=mat[0].length; //s steht hier für Anzahl der spalten
	var letzteZeile=new Array(s);
	for(var i=0;i<s;i++){
		letzteZeile[i]=1;
	}
	mat.push(letzteZeile);
	
	//fuegt eine letzte Spalte aus Nullen an die Matrix an (bzw. an jede Zeile ein weiteres Glied)
	//Achtung evtl. kann sich eine mehrdeutige lösbarkeit ergeben?!
	for(var i=0;i<mat.length;i++){
		mat[i].push(0);
	}
	mat[0][mat.length-1]=1;
	
	
	//erstelle b Vektor
	var z=mat.length;	//z steht hier fuer Anzahl der Zeilen
	var bb=new Array(s);
	for(var i=0;i<z-1;i++){
		bb[i]=0;
	}
	bb[z-1]=1;
	//console.log(mat,bb);
	var sol=gaus(mat,bb);
	//sol[sol.length-1]=0;
	sol.unshift(0);
	//console.log("phi an Ganzzahlwerten:",sol);
	return sol;
}


