/**
 *	This file contains the methods to build a chart based on the database information
 *
 * 	Dependencies:
 * 	sql.js, Chart2.6.0.min.js, stringMethods.js, jQuery.js
 */

/** build a bubble chart with the package chart.js
	 *	xAxis is stability - yAxis is domain
	 * 	can be used for other bubble charts in a modified way.
	 * @param{Array} targets - targets[0] = canvas where the chart will be built, and div where the doi is shown
	 * 						- targets[1] = possible values for x-Axis (as Strings)
	 * 						- targets[2] = possible values for y-Axis (as Strings)
	 * 						- targets[3] = factor which regulates distance between same positioned items 
	 * 						- targets[4] = radius of circles
	 */	
	function buildStabDomChart(targets){
		var types = db.exec("SELECT type,doi,domain,stability,logo,description,url,abbr FROM TYPES")[0].values;
		//console.log(types);
	
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
		
					
		//creating custom Tooltip (see http://www.chartjs.org/docs/latest/configuration/tooltip.html)
		var customTooltips1 = function(tooltipModel){
            // Tooltip Element
            var tooltipEl = document.getElementById('chartjs-tooltip');

            // Create element on first render
            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                tooltipEl.innerHTML = "<table></table>";
                document.body.appendChild(tooltipEl);
            }

            // Hide if no tooltip
            if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
            }

            // Set caret Position
            tooltipEl.classList.remove('above', 'below', 'no-transform');
            if (tooltipModel.yAlign) {
                tooltipEl.classList.add(tooltipModel.yAlign); 
            } else {
                tooltipEl.classList.add('no-transform');
            }
         
            function getBody(bodyItem) {
                return bodyItem.lines;
            }

            // Set Text
            if (tooltipModel.body) {
                var titleLines = tooltipModel.title || [];
                var bodyLines = tooltipModel.body.map(getBody);
                var innerHtml = '<thead>';

                titleLines.forEach(function(title) {
                    innerHtml += '<tr><th>' + title + '</th></tr>';
                });
                innerHtml += '</thead><tbody>';
                bodyLines.forEach(function(body, i) {
                    var colors = tooltipModel.labelColors[i];
                    var style = 'background:' + colors.backgroundColor;
                    style += '; border-color:' + colors.borderColor;
                    style += '; border-width: 1px';
                    innerHtml += '<tr><td>' + body + '</td></tr>';
                });
                innerHtml += '</tbody>';

                var tableRoot = tooltipEl.querySelector('table');
                tableRoot.innerHTML = innerHtml;
            }
            //get absolute position of div-element (by jQuery method .offset())
			var pos = $(document.getElementById(targets[0][0])).offset();
           
            //displays tooltip on hover
            tooltipEl.style.opacity = 1;
            //sets tooltip to right position tooltipModel.caretX gives right part of tooltip
            tooltipEl.style.left = pos.left + tooltipModel.caretX + 'px';  
            tooltipEl.style.top = pos.top + tooltipModel.caretY + 'px';
            tooltipEl.style.fontFamily = tooltipModel._fontFamily;
            tooltipEl.style.fontSize = tooltipModel.fontSize;
            tooltipEl.style.fontStyle = tooltipModel._fontStyle;
            
            //better way to set padding: style css...
            //tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
            //tooltipEl.style.padding = 0+ 'px ' + 0 + 'px';
                
            //updating doi if wanted:
            if(targets[0].length==2){
            	var id=tooltipModel.dataPoints[0].datasetIndex;
            	var name= waveletItems[id].label;
				var doi = waveletItems[id].doi;
				document.getElementById(targets[0][1]).innerHTML = buildReferenceLink(name,doi);
			}
		};
        
            
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
					//mode: 'index',
					position: 'nearest',
					custom: customTooltips1,
	       			callbacks: {
	       	          	title: function(tooltipItem, chart) {
	                		return '';
	                   },
	                    afterTitle: function(tooltipItem,chart){
	                    	var id = tooltipItem[0].datasetIndex;
	                    	var desc=waveletItems[id].description;
	                		var name=waveletItems[id].label;
	                		var picLink=waveletItems[id].logo;
	                    	return buildTooltipContent(name, desc, picLink);
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
	
		//add function that changes page on click
	document.getElementById(targets[0][0]).onclick = function(evt){
	     var index = chart.lastActive[0]._datasetIndex;
	  	//console.log(index);
		  	
	  	 if (index !== undefined) {
	       	var dataset = chart.data.datasets[index];
	       	document.location.href = dataset.url;
	   	}		     
	};
}
