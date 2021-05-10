module.exports = function( main ){
	const fs = require('fs');
	const fsEx = require('fs-extra');
	const it79 = require('iterate79');
	const utils79 = require('utils79');
	const options = main.get_options();
	const _this = this;
	this.path_export_to = null;
	this.export_options = {};


	/**
	 * エクスポートを開始する
	 */
	this.start = function(path_export_to, export_options){
		console.log('============= starting Export:');
		console.log('  Export to:', path_export_to);
		console.log('  Export Options:', export_options);
		console.log('  ------');

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

				this.path_export_to = path_export_to;
				this.export_options = export_options;

				// console.log( path_export_to );

				do_export(function(){
					rlv();
				});

			} catch(e){
				rjt( 'Failed to Export:' + e.message );
				return;
			}

		});
	}


	/**
	 * 出力を実行する
	 */
	function do_export( callback ){
		console.log(_this.path_export_to);
		console.log(_this.export_options);

		let count = 0;
		let list = [];

		it79.fnc({}, [
			function( it1 ){
				main.count().then((result) => {
					console.log('Total count:', result);
					count = result;
					it1.next();
				});
			},
			function( it1 ){
				main.each( function( uriInfo, next ){
					export_one(uriInfo)
						.then( () => {
							next();
						} )
					;
				} )
					.then( () => {
						it1.next();
					} );
			},
			function( it1 ){
				callback();
			}
		]);

	}


	/**
	 * ファイル1件毎の出力処理
	 */
	async function export_one(urlInfo){
		return new Promise( (rlv, rjt) => {
			console.log();
			console.log('--------', urlInfo.scheme + '://' + urlInfo.host + urlInfo.path);

			if( !urlInfo.status ){
				console.error('not done.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.result == 'ignored' ){
				console.error('Ignored URI.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.response_status == 404 ){
				console.error('URL not found.');
				console.log();
				rlv();
				return;
			}

			if( urlInfo.response_status >= 300 && urlInfo.response_status <= 399 ){
				console.error('Redirect.');
				console.log();
				rlv();
				return;
			}

			let dirname_hostname,
				newFilePath,
				parsedUrl;

			it79.fnc({}, [
				function(it1){

					let tmpHostName = urlInfo.host.split(/[^a-zA-Z0-9\_\-\.]/).join('___');

					dirname_hostname = urlInfo.scheme + '---' + tmpHostName;

					parsedUrl = new URL(urlInfo.scheme + '://' + urlInfo.host + urlInfo.path);
					// console.log( parsedUrl );

					newFilePath = dirname_hostname + parsedUrl.pathname;
					if( newFilePath.match(/\/$/) ){
						newFilePath += 'index.html';
					}

					it1.next();
				},
				function(it1){
					// console.log(newFilePath);
					let dirname = newFilePath.replace(/\/[^\/]*$/, '/');
					fsEx.mkdirpSync(_this.path_export_to + dirname);


					let bin = (new Buffer(urlInfo.response_body_base64, 'base64'));
					fs.writeFileSync( _this.path_export_to + newFilePath, bin, {} );

					it1.next();
				},
				function(){
					console.log();
					rlv();
				}
			]);

		});
	}

}
