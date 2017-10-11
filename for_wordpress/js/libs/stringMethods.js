/** This file contains functions for string manipulations.
 * 
 *  Dependencies: none
 *
 *	(last modification: 19.8.17 Simon)
 */


/** Adds html-tags to a string. After a maximum 'num' chars a new paragraph is added.
 * If a html-tag is already in the input-string, we do not change the input string. 
 *
 * 
 *   @param{string} str - text which we want to split into paragraphs
 *   @param{int} num - maximum number of chars, which belong to one paragraph
 * 
 *   @return{int} str - output string
 */
function splitter(str, num) {
	var marker2 = 0;
	var marker1 = 0;
	
	if(str==""){return str;};

	if (str.indexOf("</") != -1) {
		console.log("Seems as the string already contains html-tags, do not add more html-tags for paragraphs");
		return str;
	}

	while (marker1 < str.length) {
		marker1 = marker2;

		for ( marker2 = marker2 + num; marker2 > marker1; marker2--) {
			//if marker2 is at the end - so the full text is parsed
			if (marker2 == str.length) {
				str = [str.slice(0, marker1), "<p>", str.slice(marker1)].join('');
				marker2 = marker2 + 3;
				str = [str.slice(0, marker2), "</p>", str.slice(marker2)].join('');
				marker2 = marker2 + 4;
				return str;
			}
			//if an space to seperate the text is found
			if (str.charAt(marker2) == " ") {
				str = [str.slice(0, marker1), "<p>", str.slice(marker1)].join('');
				marker2 = marker2 + 3;
				str = [str.slice(0, marker2), "</p>", str.slice(marker2)].join('');
				marker2 = marker2 + 4;
				break;
			}
			//if no space is found to seperate the text
			if (marker2 == marker1 + 1) {
				console.log("a word is longer than " + num + " charakters");
				return str;
			}
		}
	}
}

/** !Outdated!
 *  builds a html-string to build the tooltip content for the timeline
 *  (last modification: 17.5.17 Simon)
 * 
 *  @param{String} name - name of the wavelet-system-type
 *  @param{String} description - description for the tooltip
 *  @param{String} picLink - Link where to load the logo from
 */
/*function buildTooltipContent(name, description, picLink){
	var htmlString = "<p></p><h3>" + name + "</h3>" + "<p></p>";	
	if(description!=undefined){
		htmlString += splitter(description, 30);
	}
			 
	if(picLink!=undefined){
		htmlString += "<p ><img src='" + picLink + "' width='100' max-height='50'>" + "</p>";
	}
	return htmlString;		 
}*/

/**
 *  builds a html-string to build the tooltip content for the timeline
 *  (last modification: 31.8.17 Simon)
 * 
 *  @param{String} name - name of the wavelet-system-type
 *  @param{String} description - description for the tooltip
 *  @param{String} picLink - Link where to load the logo from
 */
function buildTooltipContent2(name, description, picLink, doi, url){
	var htmlString = "<p></p>" + "<a href='"+url+"' ><h3>"+name+ "</h3></a>" + "<p></p>";	
	if(description!=undefined){
		htmlString += splitter(description, 30);
	}
			 
	if(picLink!=undefined){
		htmlString += "<p ><img src='" + picLink + "' width='100' max-height='50'>" + "</p>";
	}
	if(doi!=undefined && doi!=''){
		console.log('doi',doi);
		htmlString += buildReferenceLink(name,doi);
	}
	console.log(htmlString);
	return htmlString;		 
}

/**
 *  builds a html-string to place a link of a doi in a div in the html-page
 *  (last modification: 17.5.17 Simon)
 * 
 *  @param{string} name - name of the wavelet-system-type
 *  @param{doi} doi - doi of the reference (can also be a link)
 */
function buildReferenceLink(name, doi){
	//console.log("doi",doi);
	if(doi==undefined){
		console.log("No link available.");
		return " ";
	}
	
	
	var link = doi; //if no link is given, the link stays empty
	
	//if the link is link starting with 'www.'
	if(doi.startsWith("www.")){
		link = "http://"+doi;		
	}

	//if link is an DOI we add a adress to open - else nothing is done, we just hope it is a valid url
	if(doi.startsWith("10")){
		link = "http://www.dx.doi.org/"+doi;		
	}
	
	var htmlString = "<p> Reference of "+name+": </p> " + "<a href='"+link+"' >"+link+ "</a>"; 
	return htmlString;
}

/** parses an array which stores the critical sobolev exponents of a wavelet system.
 * @param{string} str string which contains the sobolev exponents
 * 
 * @return{array} strArr array of strings which contains one entry for every function
 *
 **/
function parseExpArray(str){
	if(str.startsWith('[')&&str.endsWith(']')){
		str=str.slice(1,str.length-1);
		str=str.split(',');
		return str;
	}
	else{
		return str;		
	}
}
