module.exports = function( main ){

	this.extract = function( url, realpath_file, base64, callback ){
		console.log('=-=-=-= extract: CSS', url, realpath_file, base64);
		callback();
	}

}
