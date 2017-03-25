function valuesOfDaubechiesWav(mask,a_start,deli,trans,acc){
	var values1 = waveletPointEvaluation(mask, a_start, mask, a_start, acc); 
	return deliAndTrans(deli,trans,values1);
}

function valuesOfDaubechiesScf(mask,a_start,deli,trans,acc){
	var values1 = iterativePointEvaluation2(mask, a_start, acc, 0);
	return deliAndTrans(deli,trans,values1);
}
