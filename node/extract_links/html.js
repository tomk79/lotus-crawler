module.exports = function( main, dba ){
	const cheerio = require('cheerio');
	const fs = require('fs');
	const it79 = require('iterate79');

	this.extract = function( url, realpath_file, base64, callback ){
		// console.log('=-=-=-= extract: HTML', url, realpath_file, base64);

		let bin = fs.readFileSync( realpath_file ).toString();
		let $ = cheerio.load(bin, {decodeEntities: false});

		it79.fnc({}, [
			function(it1){
				// --------------------------------------
				// href 属性
				let $attrHrefs = $('[href]');
				$attrHrefs.each(function(idx, elm){
					console.log( idx, elm.attribs.href );
					let targetUri = main.resolveLinkToUri( url, elm.attribs.href );
					console.log(targetUri);
				});
				it1.next();
			},
			function(it1){
				// --------------------------------------
				// src 属性
				let $attrSrcs = $('[src]');
				$attrSrcs.each(function(idx, elm){
					console.log( idx, elm.attribs.src );
					let targetUri = main.resolveLinkToUri( url, elm.attribs.src );
					console.log(targetUri);
				});
				it1.next();
			},
			function(it1){
				// --------------------------------------
				// style 要素
				let $styles = $('style');
				$styles.each(function(idx, elm){
					// console.log( idx, elm.childNodes );
					elm.childNodes.forEach(function(node, idx2){
						console.log( idx, idx2, node.data );
						// TODO: CSSのパーサーを通す
					});
				});
				it1.next();
			},
			function(it1){
				// --------------------------------------
				// style 属性
				let $attrStyles = $('[style]');
				$attrStyles.each(function(idx, elm){
					console.log( idx, elm.attribs.style );
					// TODO: CSSのパーサーを通す
				});
				it1.next();
			},
			function(it1){
				callback();
			},
		]);
	}

}
