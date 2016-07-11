/** This file contains the function of the Gauss-Algorithm to solve unique solvable linear equation systems.
 * They do not need to be square
 *
 *	(last modification: 25.4.16 Simon) 
 **/
 
 
 /** @param{Array} 	array	the matrix of the linear system (Ax=b) to be solved.
 * 
 * @param{Array} 	array   the vector b
 * @return{Array} 	array   the vector x
 */
function gaus2($A, $x) {

	$rows=$A.length;
	$columns=$A[0].length;
	
	if($rows!=$x.length){
		return new Error('Wrong size of matrix or vector');
	}
    
    if($columns>$rows){
    	return new Error('an linear equation system can not be unique solvable if you have more columns than rows');
    }
	
	// adds the x-Vector as last column    
    for ($i=0; $i < $rows; $i++) { 
        $A[$i].push($x[$i]);
    }
    
	//iterate through all rows to get upper-triangular form and some zero lines
    for ($i=0; $i < $columns; $i++) { 
    	  	        
        // Search for maximum in this column
        //start with the diagonal element
        $maxEl = Math.abs($A[$i][$i]);
        $maxRow = $i;
        //iterate throw the rows and check if there is an bigger element
        for ($k=$i+1; $k < $rows; $k++) { 
            if (Math.abs($A[$k][$i]) > $maxEl) {
                $maxEl = Math.abs($A[$k][$i]);
                $maxRow = $k;
            }
        }


        // Swap maximum row with current row (column by column)
        for ($k=$i; $k < $columns+1; $k++) { 
            $tmp = $A[$maxRow][$k];
            $A[$maxRow][$k] = $A[$i][$k];
            $A[$i][$k] = $tmp;
        }

        // Make all rows below this one 0 in current column
        //k iterates through all rows 
        for ($k=$i+1; $k < $rows; $k++) { 
        	if(Math.abs($A[$i][$i])<0.00000000000001){
        		console.log('LGS nicht eindeutig loesbar');
        		return new Error('LGS nicht eindeutig loesbar');
        	}
            $c = $A[$k][$i]/$A[$i][$i];
            //iterate throug all columns beginning at the not zero,diagonal element
            for ($j=$i; $j < $columns+1; $j++) { 
                //if we are below the current diagonal-element -> set zero
                if ($i==$j) {
                    $A[$k][$j] = 0;
                } else// subtract the line element from the current line element
                	{
                    $A[$k][$j] -= $c * $A[$i][$j];
                }
            }
        }
        //console.log("Matrix nach step",$i);
        //printMatrix($A);      
    }
	//At this point we should have an upper triangular matrix with (rows-columns) zero lines 
	//(maybe that the last lines are not exactly zero because of numerical mistakes. 
	// we will not pay attention to them anymore.)
	
	
    // Solve equation Ax=b for an upper triangular matrix $A 
    $x=new Array($columns);
    //set all x entries to zero
    for(var $m=0; $m<$x.length;$m++){
    	$x[$m]=0;
    }

    //iterate throw the columns beginning at the last
    for ($i=$columns-1; $i > -1; $i--) { 
    	//divide the line through A[i][i]
    	if(Math.abs($A[$i][$i])<0.0000000001){
        	console.log('LGS nicht eindeutig loesbar');
        	return new Error('LGS nicht eindeutig loesbar');
    	}
    	
        $x[$i] = $A[$i][$columns]/$A[$i][$i];
        $A[$i][$i]=1;
        
        //iterates through the lines above (same, fixed column) and subtracts the current line       
        for ($k=$i-1; $k > -1; $k--) { 
            $A[$k][$columns] -= $A[$k][$i] * $x[$i];
            //not necessary, but so we get a diagonal matrix.
            $A[$k][$i]=0;
            
        }
        //console.log("Die Matrix nachdem eliminieren der i-ten Spalte mit i=",$i);
        //printMatrix($A);
    }
    return $x;
}
