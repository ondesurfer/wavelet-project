/**
 * this file contains the method to add the functions to some html elements on the main page
 */
	function setHtmlFunctions(){
		
		
		document.getElementById('select1').onchange=updateList;
		document.getElementById('select2').onchange=updateList;
		
		document.getElementById('input1').onchange=updateList;	
		document.getElementById('input2').onchange=updateList;
		document.getElementById('input3').onchange=updateList;
		document.getElementById('input4').onchange=updateList;
		
		document.getElementById('input7').onclick=updateList;
		
		document.getElementById('select3').onchange=function(){
			document.getElementById('textarea1').value="";
		};
		
		//prevents that an 'enter' in one of the text-fields causes a new load of the page
		document.getElementById('form1').onsubmit = function() { 				
				return false;
			};
		document.getElementById('form2').onsubmit = function() { 				
				return false;
			};
		document.getElementById('form3').onsubmit = function() { 				
				return false;
			};
		document.getElementById('form4').onsubmit = function() { 				
				return false;
			};
		
		
		//adds the showInformation function to the showInformation button 
		document.getElementById('input5').onclick = function() { 			
				showInformation(document.getElementById('select3').value);
			};
		
/** updates the List containing the scalingfunctions complying the conditions given in the html elements
 *  (last modification: 1.7.16 Simon)
 */			
		function updateList(){
			
			var cond= new Array();
			cond[0] = [document.getElementById('select1').name, document.getElementById('select1').value];
			cond[1] = [document.getElementById('select2').name, document.getElementById('select2').value];
			cond[2] = [document.getElementById('input1').name, document.getElementById('input1').value];
			cond[3] = [document.getElementById('input2').name, document.getElementById('input2').value];
			cond[4] = [document.getElementById('input3').name, document.getElementById('input3').value];
			cond[5] =  [document.getElementById('input4').name, document.getElementById('input4').value];
			
			var str= generateSQLCommand(cond);
			var newstr= "SELECT * FROM ScalingFunctionsSupp" + str;
			var currentdb = db.exec(newstr);
			
			//console.log(currentdb);	
			//console.log(currentdb[0].values[zeile]);
			fillList(currentdb);
		}
		
/** generates an SQL command for the search of the database complying the condition given in the 'cond' Array
 *  (last modification: 1.7.16 Simon)
 * 
 * @param{cond} array conditions which should be complied
 */		
		function generateSQLCommand(cond){
			str=" WHERE ";
			for(var i=0;i<cond.length;i++){
				//(-2) means, that this condition should not be included in the search
				if(cond[i][1]!=-2){
					str=str+cond[i][0]+" "+cond[i][1]+" AND ";
				}
				
			}
			//cut of the last 'AND':
			str=str.slice(0,str.length-5);
			str=str+";";
			return str;
		}
		
		
/** fills the List ('select3') with the scalingfunctions in the new database
 *  (last modification: 1.7.16 Simon)
 * 
 * @param{database} database with the elements which will be put into the list
 */		
		function fillList(database){
			var dropDB = document.getElementById('select3');
			//delete all elements
			for(var i =0; i<dropDB.length+1; i++){
				dropDB.remove(0);				
			}
			//check if there is at leas one element in the new database
			if(database[0]!=undefined){
				//add all elements to the list
				for(var j=0; j<database[0].values.length;j++){
					var option = document.createElement('option');
					//save the id of the scalingfunction as value of the option entry
					option.value = database[0].values[j][0];
					option.text = database[0].values[j][1];
					dropDB.add(option);
				}
			}
		}	

/** generates an string representing the information of a scalingfunction (given by the database) and
 * 	places it in the textfield on the html page
 *  (last modification: 1.7.16 Simon)
 * 
 * @param{idOfScf} number id of the scalingfunction
 */		
		function showInformation(idOfScf){
			var scf = db.exec("SELECT * FROM ScalingFunctionsSupp WHERE id="+idOfScf)[0].values[0];
			
			console.log(scf);
			var info = "  id= " + scf[0]+ "  name= " +scf[1] + "  doi= " + scf[2] + "  reference= " 
				+ scf[3] + "  mask= " + scf[4] + "  critical Sobolev exponent " + scf[5] + "  critical Hoelder exponent= " + scf[6] 
				+ "  exactness of polynomial approxmation= " + scf[7]+ "  comment: " + scf[11];
			
			document.getElementById('textarea1').value=info;
		}
		
	}