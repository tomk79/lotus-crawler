module.exports = function( main, dba ){
	const fs = require('fs');
	const it79 = require('iterate79');

	/**
	 * CSSファイル中のリンクを抽出する
	 */
	this.extract = function( url, realpath_file, base64, callback ){
		// console.log('=-=-=-= extract: CSS', url, realpath_file, base64);

		let bin = fs.readFileSync( realpath_file ).toString();

		this.parseCssFile(url, bin, function(urls){
			it79.ary(
				urls,
				function(itAry1, row, idx){
					// console.log(row);
					main.add_target_url( row.url, row.method )
						.then(() => {
							itAry1.next();
						});
				},
				function(){
					// console.log('======= add_target_urls done');
					callback();
				}
			);
		});
		return;
	}

	/**
	 * CSSコード中のリンクを抽出する
	 */
	this.parseCssFile = function(baseUrl, srcCss, callback){
		console.log('----- parseCssFile:', baseUrl, srcCss);
		// TODO: CSSコード中のURL抽出が未実装
		let rtn = [];
		callback( rtn );
	}

}
