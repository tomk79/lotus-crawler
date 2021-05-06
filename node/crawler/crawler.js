module.exports = function( main, dba ){
	const it79 = require('iterate79');
	const Downloader = require('./../downloader/downloader.js');

	/**
	 * クローリングを開始する
	 */
	this.start = function(){
		return new Promise( (rlv, rjt) => {
			dba.CrawlingUrl.update({
				status: 'progress',
			},{
				where: {
					status: null,
				}
			}).then( () => {
				rlv();
			} );

		}).then( () => { return new Promise( (rlv, rjt) => {
			dba.CrawlingUrl.findAll({
				where: {
					status: 'progress',
				}
			}).then( queueList => {
				// console.log('---------queueList:', queueList);
				rlv(queueList);
			} );
		} )
		}).then( (queueList) => { return new Promise( (rlv, rjt) => {
			// console.log(queueList);

			it79.ary(
				queueList,
				function(it1, row, idx){

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
							"response_status": results.response_status,
							"response_status_message": results.response_status_message,
							"request_datetime": results.request_datetime,
	                        "response_content_type": results.response_content_type,
	                        "response_document_format": documentFormat,
							"response_body_base64": results.base64,
							"response_body_size": results.size,
							"response_headers": JSON.stringify(results.response_headers),
							"response_time": results.response_time,
						}, {});

						it1.next();
					});

				},
				function(){
					rlv();
				}
			);

		} )
		}).then( () => { return new Promise( (rlv, rjt) => {
			// console.log(result);
			rlv(true);
		} )
		} );
	}
}
