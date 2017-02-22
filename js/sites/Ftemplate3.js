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
	var id = 5;
	var table = "BiMRA";
	
	/////////////////////////////////////////
	//  1. Abschnitt (Name) /////////////////
	/////////////////////////////////////////
	var funct_name = db.exec("SELECT name FROM " + table + " WHERE id = " + id)[0];
	$("#function_name").text(funct_name.values[0][0]);
	
	
	///////////////////////////////////////////
	//  2.Abschnitt(Scaling-Functions) ////////
	///////////////////////////////////////////	
	if(table=="OMRA"||table=="BiMRA"){
		var mask = JSON.parse(db.exec("SELECT mask FROM " + table + " WHERE id = " + id)[0].values[0][0]);
		var a_start = db.exec("SELECT a_start FROM " + table + " WHERE id = " + id)[0].values[0][0];
		//console.log('mask',  mask, 'astart', a_start);
		var valuesScf1=iterativePointEvaluation2(mask, a_start, 8, 0);
		
		//fuege Funktion zu slider hinzu:
		$("#slider1").change(function(){
			sliderChangeOMRA(plot1,valuesScf1,1);
		});
		
		$("#slider2").change(function(){
			sliderChangeOMRA(plot1,valuesScf1,1);
		});
				
	}
	if(table=="BiMRAIWavelets"){
		var d= db.exec("SELECT d FROM " + table + " WHERE id = " + id)[0].values[0][0];
		$("#slider1").change(function(){
			sliderChangeBiMRAI(d);
		});
		
		$("#slider2").change(function(){
			sliderChangeBiMRAI(d);
		});
	}
	
	//fuehre Funktion einmal beim starten aus
	$("#slider1").change();
	
	///////////////////////////////////////////
	//   3.Abschnitt (Information) ////////////
	///////////////////////////////////////////
	var scf = db.exec("SELECT * FROM " + table + " WHERE id = " + id)[0];
	//console.log ('scf', scf);
	
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
		//if it is just one id (not an array stored in the database)
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
			var valuesDscf=iterativePointEvaluation2(dualMask, a_tilde_start, 8, 0);  
			//fuege Funktion zu slider hinzu:
			$("#slider3").change(function(){
				sliderChangeOMRA(plot2,valuesDscf,2);
			});
			$("#slider4").change(function(){
				sliderChangeOMRA(plot2,valuesDscf,2);
			});
			$("#slider4").change();
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
				var valuesWav=waveletPointEvaluation(mask, a_start, dualMask, a_tilde_start, 8); 
				
				$("#slider5").change(function(){
					sliderChangeOMRA(plot3,valuesWav,3);
				});
				$("#slider6").change(function(){
					sliderChangeOMRA(plot3,valuesWav,3);
				});
				$("#slider6").change();
			}
		});
		
		$('#select-dual-scfs').change();
	
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
		//console.log('info', info);
		return info;	
}

//is invoked if one of the sliders of scf is changed
function sliderChangeOMRA(plot,valuesOld,mode){
	if(mode==1){
		j=$("#slider1").val();
		k=$("#slider2").val();
		$("#levelOfSlider1").text("j="+j);
		$("#levelOfSlider2").text("k="+k);
	}
	else if(mode==2){
		j=$("#slider3").val();
		k=$("#slider4").val();
		$("#levelOfSlider3").text("j="+j);
		$("#levelOfSlider4").text("k="+k); //irgendwie wird hier k zu string umgewandelt
	}
	else if(mode==3){
		j=$("#slider5").val();
		k=$("#slider6").val();
		$("#levelOfSlider5").text("j="+j);
		$("#levelOfSlider6").text("k="+k); //irgendwie wird hier k zu string umgewandelt
	}
	var valuesNew=deliAndTrans(j,parseInt(k),valuesOld); 
	plot.drawValues(valuesNew);
}

function sliderChangeBiMRAI(d){
	var j= $("#slider1").val();
	//fit maximum of slider to number of scaling functions
	$('#slider2').prop({
			'min': 0,
            'max': Math.pow(2,j)+d-2,
        });
	var k= $("#slider2").val();
	
	$("#levelOfSlider1").text("j="+j);
	$("#levelOfSlider2").text("k="+k);
	
	var valuesScf = valuesOfPrimalPrimbsScf(j,d,k);
	plot1.drawValues(valuesScf);
}

function plotWavelet(){
	
}
