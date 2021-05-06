module.exports = function( main, dba ){
	const it79 = require('iterate79');
	const Downloader = require('./../downloader/downloader.js');

	/**
	 * クローリングを開始する
	 */
	this.start = function(){
		return new Promise( (rlv, rjt) => {
			dba.CrawlingUrl.findAll({
				where: {
					status: null,
				}
			}).then( queueList => {
				// console.log('---------queueList:', queueList);
				rlv(queueList);
			} );

		}).then( (queueList) => { return new Promise( (rlv, rjt) => {
			// console.log(queueList);

			it79.ary(
				queueList,
				function(it1, row, idx){

					const downloader = new Downloader(main);
					downloader.download(row, function(){
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
