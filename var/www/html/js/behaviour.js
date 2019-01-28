document.addEventListener('DOMContentLoaded', function(event) {
    const thumbnailElement = document.getElementById('smart_thumbnail');
    thumbnailElement.addEventListener('click', function(event) {
	const original = (thumbnailElement.className||'')+'';// not sure what non-existent classname is, hopefully not and object :P
	
	thumbnailElement.className = (original).replace('small', '').replace('  ', ' ');// dont want spaces building up i guess
	if (thumbnailElement.className === original) { thumbnailElement.className += ' small'; }// braces are gooooooood
    });
});
