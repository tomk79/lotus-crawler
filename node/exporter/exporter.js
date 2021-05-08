module.exports = function( main ){
	const fs = require('fs');
	const fsEx = require('fs-extra');
	const it79 = require('iterate79');
	const utils79 = require('utils79');
	let options = main.get_options();


	/**
	 * クローリングを開始する
	 */
	this.start = function(path_export_to, export_options){
		console.log('============= starting Export with:', path_export_to, export_options);

		return new Promise( (rlv, rjt) => {

			try {
				if( !fsEx.existsSync( path_export_to ) ){
					if( !fsEx.mkdirSync( path_export_to ) ){
						rjt( 'Failed to mkdir: ' + path_export_to );
						return;
					}
				}
				path_export_to = path_export_to.replace( /[\/\\]*$/, '/' );
				if( !path_export_to.match( /\/$/ ) ){
					path_export_to += '/';
				}

				// console.log( path_export_to );

				rlv();

			} catch(e){
				rjt( 'Failed to Export:' + e.message );
				return;
			}

		});
	}

}
