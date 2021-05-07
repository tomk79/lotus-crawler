module.exports = function( main ){

	this.extract = function( url, realpath_file, base64, callback ){
		console.log('=-=-=-= extract: HTML', url, realpath_file, base64);
		callback();
	}

}
