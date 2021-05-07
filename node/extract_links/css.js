module.exports = function( main, dba ){

	/**
	 * CSSファイル中のリンクを抽出する
	 */
	this.extract = function( url, realpath_file, base64, callback ){
		console.log('=-=-=-= extract: CSS', url, realpath_file, base64);
		callback();
	}

}
