module.exports = function( main ){
	const cheerio = require('cheerio');
	const fs = require('fs');

	this.extract = function( url, realpath_file, base64, callback ){
		// console.log('=-=-=-= extract: HTML', url, realpath_file, base64);

		let bin = fs.readFileSync( realpath_file ).toString();

		let $ = cheerio.load(bin, {decodeEntities: false});


		// --------------------------------------
		// href 属性
		let $attrHrefs = $('[href]');
		$attrHrefs.each(function(idx, elm){
			console.log( idx, elm.attribs.href );
		});

		// --------------------------------------
		// src 属性
		let $attrSrcs = $('[src]');
		$attrSrcs.each(function(idx, elm){
			console.log( idx, elm.attribs.src );
		});

		// --------------------------------------
		// style 要素
		let $styles = $('style');
		$styles.each(function(idx, elm){
			// console.log( idx, elm.childNodes );
			elm.childNodes.forEach(function(node, idx2){
				console.log( idx, idx2, node.data );
			});
		});

		// --------------------------------------
		// style 属性
		let $attrStyles = $('[style]');
		$attrStyles.each(function(idx, elm){
			console.log( idx, elm.attribs.style );
		});

		callback();
	}

}
