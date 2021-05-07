module.exports = function( main, dba ){
	const it79 = require('iterate79');
	const Downloader = require('./../downloader/downloader.js');
	let currentTargetAry = [];


	/**
	 * クローリングを開始する
	 */
	this.start = function(){
		return new Promise( (rlv, rjt) => {
			crawlingLoop( function(){
				rlv( true );
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
				dba.CrawlingUrl.update({
					status: 'progress',
				},{
					where: {
						status: null,
					}
				}).then( () => {
					it1.next();
				} );
			},
			function( it1 ){
				dba.CrawlingUrl.findAll({
					where: {
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

						const downloader = new Downloader(main);
						downloader.download(row, function( results ){

							let documentFormat;
							switch( results.response_content_type ){
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
								"response_body_base64": results.base64,
								"response_body_size": results.size,
								"response_headers": JSON.stringify(results.headers),
								"response_time": results.time,
							}, {});

							itAry1.next();
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

}
