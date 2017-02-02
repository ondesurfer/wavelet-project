/**
 *	This file contains the method to add the functions to some html elements on
 * 	the Ftemplate2.html file
 * 
 * 	Dependencies:
 * 	sql.js, dbMethods.js
 */

function setHtmlFunctions() {
	//load given Data from page before. (Ftemplate2)
	//var id = getQueryVariable("id");
	//var table = getQueryVariable("table");
	
	//to test:
	var id = 6;
	var table = "BiMRA";
	
	/////////////////////////////////////////
	//  1. Abschnitt/////////////////////////
	/////////////////////////////////////////
	var funct_name = db.exec("SELECT name FROM " + table + " WHERE id = " + id)[0];
	$("#function_name").text(funct_name.values[0][0]);
	
	
	///////////////////////////////////////////
	//  2.Abschnitt ///////////////////////////
	///////////////////////////////////////////
	
	if(table=="OMRA"||table=="BiMRA"){
		var mask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + id)[0].values[0][0]);
		var a_start = db.exec("SELECT a_start FROM " + table + " WHERE id = " + id)[0].values[0][0];
		console.log('mask',  mask, 'astart', a_start);
		valuesScf=iterativePointEvaluation2(mask, a_start, 8, 0); 
		plotInstance1.draw();
	}
	
	///////////////////////////////////////////
	//   3.Abschnitt (Information) ////////////
	///////////////////////////////////////////
	var scf = db.exec("SELECT * FROM " + table + " WHERE id = " + id)[0];
	console.log ('scf', scf);
	
	var str = generateInfoString(table,scf);
	$(info).val(str);
	
	///////////////////////////////////////////
	// 4. Abschnitt (duale scf) ///////////////
	///////////////////////////////////////////
	
	if(table=="BiMRA"){
		var dualIds = JSON.parse(db.exec("SELECT ID_of_dual_function FROM " + table + " WHERE id = " + id)[0].values[0][0]);
		
		
		//adding all possible dual functions to select menue
		if(dualIds.constructor === Array){
			for(var j=0; j< dualIds.length; j++){			
				$('#select-dual-scfs').append($('<option>', {
	   				value: db.exec("SELECT ID FROM " + table + " WHERE id = " + dualIds[j])[0].values[0][0],
	    			text: db.exec("SELECT name FROM " + table + " WHERE id = " + dualIds[j])[0].values[0][0]
				}));
			}
		}
		else{$('#select-dual-scfs').append($('<option>', {
	   				value: db.exec("SELECT ID FROM " + table + " WHERE id = " + dualIds)[0].values[0][0],
	    			text: db.exec("SELECT name FROM " + table + " WHERE id = " + dualIds)[0].values[0][0]
			}));
		}
		
	}
	else{
		$(dscf).hide();
	}
	
	
	$('#select-dual-scfs').change(function(){
		if(table=="BiMRA"){
		
			var dualID = $('#select-dual-scfs').val();
			var dualMask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + dualID)[0].values[0][0]);
			console.log('dualMask',dualMask);
			var a_tilde_start=db.exec("SELECT a_start FROM " + table + " WHERE id = " + dualID)[0].values[0][0];
			valuesDer=iterativePointEvaluation2(dualMask, a_tilde_start, 8, 0);  
			plotInstance2.draw();
		}
	});
	
	///////////////////////////////////////////
	//  5.Abschnitt (Wavelet-Plot) ////////////
	///////////////////////////////////////////
	$('#select-dual-scfs').change(function(){
		if(table=="OMRA"||table=="BiMRA"){
				var mask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + id)[0].values[0][0]);
				var a_start = db.exec("SELECT a_start FROM " + table + " WHERE id = " + id)[0].values[0][0];
				var dualMask;
				var a_tilde_start;
				if(table=="OMRA"){
					dualMask = mask;
					a_tilde_start=a_start;
				}
				if(table=="BiMRA"){
					var dualID = $('#select-dual-scfs').val();
					console.log('dualID',dualID);
					console.log(db.exec("SELECT mask FROM " + table + " WHERE id = " + dualID)[0].values[0]);
					dualMask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + dualID)[0].values[0][0]);
					console.log('dualMask',dualMask);
					a_tilde_start=db.exec("SELECT a_start FROM " + table + " WHERE id = " + dualID)[0].values[0][0];
				}
				
				console.log('mask',  mask, 'astart', a_start);
				valuesWav=waveletPointEvaluation(mask, a_start, dualMask, a_tilde_start, 8); 
				plotInstance3.draw();
			}
		});
	
}

// generates an string containing all information given in one database line
// input: scf - object containing line and columns of the choosen funktion in Database
function generateInfoString(table,scf) {
		var info = "table: " + table +"\n";
		for(var column = 0; column < scf.columns.length; column++){
			//info += "<p> ";
			info += scf.columns[column];
			info += ": ";
			info += scf.values[0][column] + "\n";
		}
		console.log('info', info);
		return info;	
}

function plotWavelet(){
	
}
