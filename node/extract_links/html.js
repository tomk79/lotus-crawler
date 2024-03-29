module.exports = function( main ){
	const cheerio = require('cheerio');
	const fs = require('fs');
	const it79 = require('iterate79');
	const ExtractLinks_Css = require('./css.js');

	/**
	 * HTMLファイル中のリンクを抽出する
	 */
	this.extract = function( url, realpath_file, base64, callback ){
		// console.log('=-=-=-= extract: HTML', url, realpath_file, base64);

		let bin = fs.readFileSync( realpath_file ).toString();
		let $ = cheerio.load(bin, {decodeEntities: false});

		it79.fnc({}, [
			function(it1){
				// --------------------------------------
				// href 属性
				let $attrHrefs = $('[href]');
				let urlList = [];
				$attrHrefs.each(function(idx, elm){
					// console.log( idx, elm.attribs.href );
					let targetUri = main.resolveLinkToUri( url, elm.attribs.href );
					// console.log(targetUri);
					urlList.push({
						url: targetUri,
						method: 'GET',
					});
				});
				add_target_urls(urlList, url, function(){
					it1.next();
				});
			},
			function(it1){
				// --------------------------------------
				// src 属性
				let $attrSrcs = $('[src]');
				let urlList = [];
				$attrSrcs.each(function(idx, elm){
					// console.log( idx, elm.attribs.src );
					let targetUri = main.resolveLinkToUri( url, elm.attribs.src );
					// console.log(targetUri);
					urlList.push({
						url: targetUri,
						method: 'GET',
					});
				});
				add_target_urls(urlList, url, function(){
					it1.next();
				});
			},
			function(it1){
				// --------------------------------------
				// style 要素
				let $styles = $('style');
				let srcList = [];
				$styles.each(function(idx, elm){
					// console.log( idx, elm.childNodes );
					elm.childNodes.forEach(function(node, idx2){
						// console.log( idx, idx2, node.data );
						srcList.push( node.data );
					});
				});

				it79.ary(
					srcList,
					function(itAry, srcCss, idx){
						const extractLinks_Css =  new ExtractLinks_Css(main);
						extractLinks_Css.parseCssFile(url, srcCss, function(urlList){
							add_target_urls(urlList, url, function(){
								itAry.next();
							});
						});
					},
					function(){
						it1.next();
					}
				);
			},
			function(it1){
				// --------------------------------------
				// style 属性
				let $attrStyles = $('[style]');
				let srcList = [];
				$attrStyles.each(function(idx, elm){
					// console.log( idx, elm.attribs.style );
					srcList.push( elm.attribs.style );
				});

				it79.ary(
					srcList,
					function(itAry, srcCss, idx){
						const extractLinks_Css =  new ExtractLinks_Css(main);
						extractLinks_Css.parseCssFile(url, srcCss, function(urlList){
							add_target_urls(urlList, url, function(){
								itAry.next();
							});
						});
					},
					function(){
						it1.next();
					}
				);
			},
			function(it1){
				callback();
			},
		]);
	}


	/**
	 * 待機リストに追加する
	 */
	function add_target_urls( urls, baseUrl, callback ){
		let request_options = {
			"headers": {}
		};
		request_options.headers['referer'] = baseUrl;

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
		return;
	}


}
