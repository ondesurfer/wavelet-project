/**
 *  This file contains functions to handle the database object generated by sql.js
 *	
 *	Dependencies: sql.js 
 *  	
 *	(last modification: 1.7.16 Simon)
 */

/** 
 *  Load the database named './ScalingFunctions.sqlite'
 *  (must exist in the same folder as the html-file) in a new thread.
 *  (last modification: 1.7.16 Simon)
 */	
function loadDB(){
		
		//builds an HttpRequest on 'theUrl' and runs the 'callback' function with the content of the HttpRequest response
		function httpGetAsync(theUrl, callback){
   			var xmlHttp = new XMLHttpRequest();
   			xmlHttp.responseType = 'arraybuffer';
   			 
   			
    		xmlHttp.onreadystatechange = function() { 
    			//if the XMLHttpRequest was successful run the callback function with the response
        		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            		callback(xmlHttp.response);
    			}
    		};
    		xmlHttp.open("GET", theUrl, true); // true bedeutet, dass onreadystate in neuem thread aufgerufen wird
    		xmlHttp.send(null);
		}
		 
		//constructs the callback function and runs the HttpRequest
		function start(){			
		
			var callback = function(str){
				var uInt8Array = new Uint8Array(str);
				// do not use a 'var' here! So the database is saved as an global document. attribute
  				db = new SQL.Database(uInt8Array);
  				//when the Database is loaded the list containing the scf is updated
  				updateScfList();
  				
  				//assuming that the selected primal scaling function by default has ID 1
  				updateDualScfList(1);
			};
			httpGetAsync('./ScalingFunctions.sqlite', callback);				
		}
		
		start();
}

/**
 *  This file contains functions to handle the database object generated by sql.js
 *	
 *	Dependencies: sql.js 
 *  	
 *	(last modification: 20.1.17 Andreas)
 */

/** 
 *  Load the database named './wavelet_database.sqlite'
 *  (must exist in the same folder as the html-file) in a new thread.
 *  (last modification: 20.1.17 Andreas)
 */
function loadWaveletDB(){
		
		//builds an HttpRequest on 'theUrl' and runs the 'callback' function with the content of the HttpRequest response
		function httpGetAsync(theUrl, callback){
   			var xmlHttp = new XMLHttpRequest();
   			xmlHttp.responseType = 'arraybuffer';
   			 
   			
    		xmlHttp.onreadystatechange = function() { 
    			//if the XMLHttpRequest was successful run the callback function with the response
        		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            		callback(xmlHttp.response);
    			}
    		};
    		xmlHttp.open("GET", theUrl, true); // true bedeutet, dass onreadystate in neuem thread aufgerufen wird
    		xmlHttp.send(null);
		}
		 
		//constructs the callback function and runs the HttpRequest
		function start(){			
		
			var callback = function(str){
				var uInt8Array = new Uint8Array(str);
				// do not use a 'var' here! So the database is saved as an global document. attribute
  				db = new SQL.Database(uInt8Array);
  				//when the Database is loaded the list containing the scf is updated
  				updateScfList();
  				
  				//assuming that the selected primal scaling function by default has ID 1
  				updateDualScfList(1);
			};
			httpGetAsync('./wavelet_database.sqlite', callback);				
		}
		
		start();
}

/** 
 *  Load the database named './wavelet_database.sqlite' (without updating list-elements)
 *  (must exist in the same folder as the html-file) in a new thread.
 *  (last modification: 26.1.17 Andreas)
 */
function loadWaveletDB1(){
		//builds an HttpRequest on 'theUrl' and runs the 'callback' function with the content of the HttpRequest response
		function httpGetAsync(theUrl, callback){
   			var xmlHttp = new XMLHttpRequest();
   			xmlHttp.responseType = 'arraybuffer';
   			 
    		xmlHttp.onreadystatechange = function() { 
    			//if the XMLHttpRequest was successful run the callback function with the response
        		if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
            		callback(xmlHttp.response);
    			}
    		};
    		xmlHttp.open("GET", theUrl, true); // true bedeutet, dass onreadystate in neuem thread aufgerufen wird
    		xmlHttp.send(null);
		}
		 
		//constructs the callback function and runs the HttpRequest
		function start(){			
			
			var callback = function(str){
				var uInt8Array = new Uint8Array(str);
				// do not use a 'var' here! So the database is saved as an global document. attribute
  				db = new SQL.Database(uInt8Array);
			};
			httpGetAsync('./wavelet_database.sqlite', callback);				
		}
		
		start();
}

/**
 * Generates an SQL command for searching items in the database, complying the
 * condition given in the 'cond' Array. (last modification: 8.8.16 Andreas)
 * 
 * @param{cond} array	conditions which should be complied.
 */
function genFilterString(cond) {
	str = "";
	for (var i = 0; i < cond.length; i++) {
		// (-2) means, that this condition should not be included in the search
		if (cond[i][1] != -2) {
			str = str + cond[i][0] + " " + cond[i][1] + " AND ";
		}

	}
	// cut of the last 'AND':
	str = str.slice(0, str.length - 5);
	str = str + ";";
	return str;
}

/**
* Easy way to parsing query strings
*/
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

/** to extract information from the database entry 'parameters'
 * 
 * @param {Object} array  Array containing the information.
 * @param {Object} name  name of the searched entry
 * 
 * @return{Object} array[x] value of the searched parameter.
 */
function getParameter(array,name){
	for(var j=0; j<array.length-1; j+=2){
		if(name==array[j]){
			return array[j+1];
		}
	}
	console.log("Error: parameters do not contain " + name);
	return undefined;
}

/**
*	Get a list of all differing column-entries of a table in the db.
 *
 *	@param{string} colname.
 *  @param{string} tablename.
 *
 *  @return{Array} entries.
 *  
 *  (last modification: 15.2.17 Andreas)
*/
function getDifferingColEntries(colname, tablename){
	var entries = [];
	var column = db.exec("SELECT "+colname+" FROM "+ tablename)[0].values;
	var entry_tmp = "";
	
	for (var i = 0; i < column.length; i++) {
		if(entry_tmp != column[i][0]){
			entries.push(column[i][0]);
			entry_tmp = column[i][0];
		}
	}
	
	return entries;
} 
