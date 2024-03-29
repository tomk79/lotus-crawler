module.exports = function( main ){
	const fs = require('fs');
	const fsEx = require('fs-extra');
	const it79 = require('iterate79');
	const utils79 = require('utils79');
	const Downloader = require('./../downloader/downloader.js');
	const ExtractLinks_Html = require('./../extract_links/html.js');
	const ExtractLinks_Css = require('./../extract_links/css.js');
	const dba = main.dba();
	const options = main.get_options();
	let currentTargetAry = [];


	/**
	 * クローリングを開始する
	 */
	this.start = function(){
		return new Promise( (rlv, rjt) => {
			crawlingLoop( function(){
				rlv();
			} );
		});
	}


	/**
	 * クローリングを再帰的に実行する
	 */
	function crawlingLoop( callback ){
		callback = callback || function(){};

		it79.fnc({}, [
			function( it1 ){
				main.dba().CrawlingUrl.update({
					status: 'progress',
				},{
					where: {
						user_id: options.user_id,
						project_id: options.project_id,
						status: null,
					}
				}).then( () => {
					it1.next();
				} );
			},
			function( it1 ){
				main.dba().CrawlingUrl.findAll({
					where: {
						user_id: options.user_id,
						project_id: options.project_id,
						status: 'progress',
					}
				}).then( queueList => {
					currentTargetAry = queueList;
					it1.next();
				} );
			},
			function( it1 ){
				// console.log('------ currentTargetAry:', currentTargetAry.length);
				// console.log( currentTargetAry );

				if( !currentTargetAry.length ){
					// ここで、対象の配列が空っぽなら、終了して返す。
					callback();
					return;
				}
				it1.next();
			},
			function( it1 ){
				it79.ary(
					currentTargetAry,
					function(itAry1, row, idx){
						let url = row.scheme+'://'+row.host+row.path;

						if( main.isUrlIgnored( url ) ){
							// 対象外のURL
							row.update({
								"status": "done",
								"result": "ignored",
							}, {});
							itAry1.next();
							return;
						}

						if( row.request_method !== 'GET' ){
							// GETメソッド以外はリクエストしない
							row.update({
								"status": "done",
								"result": "unsupported_method",
							}, {});
							itAry1.next();
							return;
						}

						const downloader = new Downloader(main);
						downloader.download(url, row, function( realpath_file, results ){

							let bin = fs.readFileSync( realpath_file, {} );
							let base64 = (new Buffer(bin)).toString('base64');

							let documentFormat;
							switch( results.content_type ){
								case 'text/html':
									documentFormat = 'html';
									break;
								case 'text/css':
									documentFormat = 'css';
									break;
							}

							row.update({
								"status": "done",
								"result": "ok",
								"response_status": results.status_code,
								"response_status_message": results.status_message,
								"request_datetime": results.request_datetime,
								"response_content_type": results.content_type,
								"response_document_format": documentFormat,
								"response_body_base64": base64,
								"response_body_size": bin.length,
								"response_headers": JSON.stringify(results.headers),
								"response_time": results.time,
							}, {});

							extract_links(
								documentFormat,
								url,
								realpath_file,
								base64,
								function(){
									fs.unlinkSync( realpath_file ); // 一時ファイルの削除

									if( results.headers['location'] && ( results.status_code == 301 || results.status_code == 302 || results.status_code == 307 || results.status_code == 308 ) ){
										let method = row.request_method;
										let reqOptions = JSON.parse(row.request_headers);
										if( results.status_code == 301 || results.status_code == 302 ){
											method = 'GET';
											if( reqOptions.body ){
												reqOptions.body = undefined;
											}
										}
										let redirectTo = results.headers['location'];
										let parsedUrl = new URL(url);

										if( redirectTo.match(/^\/\//) ){
											// リダイレクト先が、ホスト名以降の場合
											redirectTo = parsedUrl.protocol + redirectTo;
										}else if( redirectTo.match(/^\//) ){
											// リダイレクト先が、パス以降の場合
											redirectTo = parsedUrl.protocol + '//' + parsedUrl.host + redirectTo;
										}else if( redirectTo.match(/^[a-zA-Z0-9]+\:/) ){
											// リダイレクト先が、完全なURIの場合
										}else{
											console.error('Redirect Error: Unknown URI pattern:', redirectTo);
											itAry1.next();
											return;
										}
										main.add_target_url( redirectTo, method, reqOptions )
											.then(() => {
												itAry1.next();
											});
										return;
									}

									itAry1.next();
								}
							);
						});

					},
					function(){
						it1.next();
					}
				);
			},
			function( it1 ){
				crawlingLoop( callback );
			}
		]);

		return;
	}


	/**
	 * コンテンツからリンクを抽出する
	 */
	function extract_links( documentFormat, url, realpath_file, content_base64, callback ){
		// console.log('extract_links():', documentFormat);
		if( !documentFormat ){
			callback();
			return;
		}
		let extractLinks;
		switch( documentFormat ){
			case "html": extractLinks = new ExtractLinks_Html( main ); break;
			case "css": extractLinks = new ExtractLinks_Css( main ); break;
		}

		if( !extractLinks ){
			callback();
			return;
		}

		extractLinks.extract(
			url,
			realpath_file,
			content_base64,
			function(){
				callback();
			}
		);
		return;
	}

}
