module.exports = function( main ){
	const options = main.get_options();
	const it79 = require('iterate79');
	const utils79 = require('utils79');
	const fs = require('fs');
	const fsEx = require('fs-extra');
	const request = require('request');
	const dateformat = require('dateformat');

	this.download = function(uri, urlInfo, callback){

		const tmpFilename = options.path_data_dir + 'tmp.download';

		// console.log('--- Downloading:', urlInfo.id, uri);

		let start_time = Date.now();
		let request_datetime = dateformat(new Date(), 'isoDateTime');
		let request_headers = JSON.parse(urlInfo.request_headers);


		it79.fnc({}, [
			function(it1, args){

				request
					.get({
						url: uri,
						method: urlInfo.request_method,
						headers: request_headers,
					})
					.on('response', function(response) {
						args.res = response;
					})
					.on('error', function(err) {
						console.error(err)
					})
					.pipe(fs.createWriteStream( tmpFilename ))
					.on('close', function(){

						args.end_time = Date.now();
						args.contentType = args.res.headers['content-type'];
						args.contentType = args.contentType.replace( /\;[\s\S]*$/, '' );

						it1.next(args);
					})
				;

			},
			function(it1, args){
				callback(
					tmpFilename,
					{
						"request_datetime": request_datetime,
						"status_code": args.res.statusCode,
						"status_message": args.res.statusMessage,
						"content_type": args.contentType,
						"headers": args.res.headers,
						"time": (args.end_time - start_time) / 1000,
					}
				);
			}
		]);

	}
}
