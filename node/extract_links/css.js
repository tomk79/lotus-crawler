module.exports = function( main ){
	const fs = require('fs');
	const it79 = require('iterate79');

	/**
	 * CSSファイル中のリンクを抽出する
	 */
	this.extract = function( url, realpath_file, base64, callback ){
		// console.log('=-=-=-= extract: CSS', url, realpath_file, base64);

		let bin = fs.readFileSync( realpath_file ).toString();
		let request_options = {
			"headers": {}
		};
		request_options.headers['referer'] = url;

		this.parseCssFile(url, bin, function(urls){
			it79.ary(
				urls,
				function(itAry1, row, idx){
					// console.log(row);
					main.add_target_url( row.url, row.method, request_options )
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
		// console.log('----- parseCssFile:', baseUrl, srcCss);
		let rtn = [];

		function preg_quote(str){
			str = str.split('"').join('\\"');
			return str;
		}
		function trim(str){
			str = str.replace(/^\s*/, '');
			str = str.replace(/\s*$/, '');
			return str;
		}


		let targetUri;
		let srcAfter = '';

		// url()
		while( 1 ){
			if( !srcCss.match( /^([\s\S]*?)(\/\*|url\s*\(\s*(\"|\'|))([\s\S]*)$/si ) ){
				srcAfter += srcCss;
				break;
			}
			srcAfter += RegExp.$1;
			let $start = RegExp.$2;
			let $delimiter = RegExp.$3;
			srcCss = RegExp.$4;

			if( $start == '/*' ){
				srcAfter += '/*';

				srcCss.match( /^([\s\S]*?)\*\/([\s\S]*)$/si );
				srcAfter += RegExp.$1;
				srcAfter += '*/';
				srcCss = RegExp.$2;
			}else{
				srcAfter += 'url("';
				if( srcCss.match( new RegExp('^([\\s\\S]*?)'+preg_quote($delimiter, '/')+'\\s*\\)([\\s\\S]*)', 'si') ) ){
					targetUri = RegExp.$1;
					srcCss = RegExp.$2;
					rtn.push({
						url: main.resolveLinkToUri( baseUrl, trim( targetUri ) ),
						method: 'GET',
					});
					srcAfter += targetUri;
				}

				srcAfter += '")';
			}

		}

		// @import
		srcCss = srcAfter;
		srcAfter = '';
		while( 1 ){
			if( !srcCss.match( /^([\s\S]*?)@import\s*([^\s\;]*)([\s\S]*)$/si ) ){
				srcAfter += srcCss;
				break;
			}
			srcAfter += RegExp.$1;
			srcAfter += '@import ';
			targetUri = RegExp.$2;
			srcCss = RegExp.$3;

			targetUri = trim( targetUri );

			if( !targetUri.match(/^url\s*\(/) ){
				srcAfter += '"';
				if( targetUri.match( /^(\"|\')(.*)\1$/si ) ){
					targetUri = RegExp.$2;
					targetUri = trim( targetUri );
				}

				rtn.push({
					url: main.resolveLinkToUri( baseUrl, targetUri ),
					method: 'GET',
				});

				srcAfter += targetUri;
				srcAfter += '"';
			}else{
				srcAfter += targetUri;
			}
		}

		// console.log(srcAfter);



		// console.log(rtn);
		callback( rtn );
		return;
	}

}
