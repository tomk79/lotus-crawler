module.exports = function( main ){

	this.extract = function( url, base64, callback ){
		console.log('=-=-=-= extract: HTML', url, base64);
		callback();
	}

}
