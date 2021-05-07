module.exports = function( main, dba ){

	this.extract = function( url, realpath_file, base64, callback ){
		console.log('=-=-=-= extract: CSS', url, realpath_file, base64);
		callback();
	}

}
