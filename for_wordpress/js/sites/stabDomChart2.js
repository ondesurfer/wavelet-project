/**
 *	This file contains the methods to build a chart based on the database information
 *
 * 	Dependencies:
 * 	sql.js, Chart2.6.0.min.js, stringMethods.js, jQuery.js
 */

/** build a bubble chart with the package chart.js
	 *	xAxis is stability - yAxis is domain
	 * 	can be used for other bubble charts in a modified way.
	 * @param{Array} targets - targets[0] = canvas where the chart will be built, and id of div where tooltip is stored
	 * 						- targets[1] = possible values for x-Axis (as Strings)
	 * 						- targets[2] = possible values for y-Axis (as Strings)
	 * 						- targets[3] = factor which regulates distance between same positioned items 
	 * 						- targets[4] = radius of circles
	 */	
	function buildStabDomChart(targets){
		var types = db.exec("SELECT type,doi,domain,stability,logo,description,url,abbr FROM TYPES")[0].values;

		//all possible symmetrie types
		var xItems = targets[1];
		//all possible stability types
		var yItems = targets[2];
		
		
		var positions=getItemPositions(targets[3]);
		
		//distance between color values
		var color = Math.round(255/types.length);
		
		var waveletItems = [];
		//building all wavelet items with the information from the database
		for (var j = 0; j < types.length; j++) {
			//console.log(255-j*color);
			//console.log("rgba(" + (j*color) + "," + (255-j*color) +","+ 0 + ",0.5)");
			var obj = {
				//id is nessasary to acess the right item when it is clicked
				id : j,
				label: types[j][0],
				doi: types[j][1],
				url : types[j][6],
				logo: types[j][4],
				abbr: types[j][7],
				description: types[j][5],
				backgroundColor: "rgba(" + (j*color) + "," + 0 + ","+ (255-j*color)  + ",0.5)",
		        borderColor: "rgba(" + (j*color)+ "," + 0 + ","+ (255-j*color) + ",1)",
		       	data: positions[j],
	
			};
			waveletItems.push(obj);
		}
    
		/** calculates positions of the wavelet items
		 * in a way that two wavelet items do not cover each other 
		 *	@param{double} dist factor which determines the distance of same items with basically same positions
		 */
		function getItemPositions(dist){
			//saves positions as array of objects as needed for chart.js
			var positions=[];
			
			//matrix to calculate positions in case of more objects with same positions
			//e.g. map(1,1) contains a array of all ids which have position (1,1)
			var map=new Array(xItems.length);
			for(var k=0; k<map.length; k++){
				map[k]=new Array(yItems.length);
			}
			
			for (var id=0;id<types.length;id++){
				x1=xItems.indexOf(types[id][3]);
				y1=yItems.indexOf(types[id][2]);
		  		positions[id] = [{
	        		x: x1,
	          		y: y1,
	           		r: targets[4]
		    	}];	    	
		    	if(map[x1][y1]==undefined){
		    		map[x1][y1]=[id];
		    	}else{
		    		map[x1][y1].push(id);
		    	}
		    }
		    
		    //calculating corrected positions 
		    for(var row=0;row<map.length; row++){
		    	for(var col=0;col<map[0].length;col++){
		    		if(map[row][col]!=undefined){
			    		var anz=map[row][col].length;
			    		for(var k=0;k<anz;k++){
			    			var id = map[row][col][k];
			    			positions[id][0].x=positions[id][0].x+(k-(anz-1)/2)*dist;
			    		}
		    		}
		    	}
		    }
		   //console.log(positions);
	   		return positions;
		}
		
		
		  
		//building chart
		var chart = new Chart(document.getElementById(targets[0][0]), {
		    type: 'bubble',
		    data: {datasets: waveletItems},
		    options:{
		    	event: ['click'],
		    	responsive: true,
		      	title: {
		        	display: true,
		        	text: 'Wavelet-Systems'
		      	},
		      	scales: {
		        	yAxes: [{ 
		          		scaleLabel: {
		            		display: true,
		            		labelString: "Domain"
		          		},
		          		ticks: {
		          			suggestedMin: -0.5,
		          			suggestedMax: yItems.length-0.5,
	                    	// overwrite axis numbers
	                    	callback: function(value, index, values) {
	                        		return yItems[value];
	                    		}
	                  	}
		        	}],
		        	xAxes: [{ 
		          		scaleLabel: {
		            		display: true,
		            		labelString: "Stability"
		          		},
		           		ticks: {
		           			//0.5 extra space at the borders
		           			suggestedMin: -0.5,
		          			suggestedMax: xItems.length-0.5,
	                    	//overwrite x-axis numbers
	                    	callback: function(value, index, values) {
	                    		return xItems[value];
	                    	}
	                  	}
		        	}]
		      	},
		    	layout: {
	        		padding: {
	                	left: 0, //before: 50
	                	right: 0, //before: 50
	                	top: 0, 	//before: 50
	                	bottom: 0  //before: 50
	            	}
	       		},
	       		tooltips:{
	       			enabled: false,
	       			callbacks: {
	       	          	title: function(tooltipItem, chart) {
	                		return '';
	                   },
	                    afterTitle: function(tooltipItem,chart){
	                    	return '';
	                    },
	                    //overwrite label because we generate all content in 'afterTitle'.
	                    label: function(tooltipItem,chart){
	                    	return '';
	                    }
	       			}
	       		}
		    }
		});
	
	//Add abbreviations into every bubble     
	Chart.plugins.register({
	  afterDatasetsDraw: function(chartInstance, easing) {
	    // To only draw at the end of animation, check for easing === 1
	    
	    var ctx = chartInstance.chart.ctx;
	    chartInstance.data.datasets.forEach(function (dataset, i) {
	      var meta = chartInstance.getDatasetMeta(i);
	      if (!meta.hidden) {
	        meta.data.forEach(function(element, index) {
	          // Draw the text in black, with the specified font
	          //console.log("Chart",Chart);
	          ctx.fillStyle = 'rgb(0, 0, 0)';
	          var fontSize = 14;
	          var fontStyle = 'normal';
	          var fontFamily = 'Helvetica Neue';
	          ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
	       	
	          var id=element._datasetIndex;
	          var dataString = chart.data.datasets[id].abbr;
	          ctx.textAlign = 'center';
	          ctx.textBaseline = 'middle';
	          var padding = 5;
	          var position = element.tooltipPosition();
	          ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
	        });
	      }
	    });
	  }
	  
	});
	
	//show or hide tooltip on click
	document.getElementById(targets[0][0]).onclick = function(properties){
	  	 //if you click on a item (not the background)		 
	  	 if (chart.lastActive[0] !== undefined) {
	  	 	var index = chart.lastActive[0]._datasetIndex; 	
	       	var dataset = chart.data.datasets[index];
	  	 	updateTooltip(dataset,properties.pageX,properties.pageY);
	   	}
	   	else{
	   		var tooltipEl = document.getElementById(targets[0][1]);
	   		 tooltipEl.style.visibility = 'hidden';
	   	}			     
	};
	
/** builds or updates Tooltip
 * 
 * @param {Object} dataset object of information of clicked database item
 * @param {double} x x-position of mouse-click
 * @param {double} y y-position of mouse-click
*/
	function updateTooltip(dataset,x,y){
            // Tooltip Element
            var tooltipEl = document.getElementById(targets[0][1]);

            //update content
              console.log('dataset',dataset);
              tooltipEl.innerHTML = buildTooltipContent2(dataset.label, dataset.description, dataset.logo,dataset.doi,dataset.url);
  			
  			//update position
			//get absolute position of div-element (by jQuery method .offset())
			var pos = $(document.getElementById(targets[0][0])).offset();

            //set position to mouseklick position
            tooltipEl.style.left = x + 'px';  
            tooltipEl.style.top = y + 'px';
            tooltipEl.style.visibility = 'visible';
		};
}
