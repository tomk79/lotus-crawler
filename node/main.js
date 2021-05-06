module.exports = function( options ){
	const utils79 = require('utils79');
	const iterate79 = require('iterate79');
	const fsEx = require('fs-extra');


	// options の検査と整形
	options = options || {};
	options.ranges = options.ranges || [];
	options.ignores = options.ignores || [];
	options.path_data_dir = options.path_data_dir || '.lotusroot-crawler/';

	// データディレクトリの初期化
	if( !fsEx.existsSync(options.path_data_dir) ){
		if( !fsEx.mkdirSync(options.path_data_dir) ){
			console.error('Failed to mkdir:', options.path_data_dir);
		}
	}

	options.path_data_dir = fsEx.realpathSync(options.path_data_dir);
	options.path_data_dir += options.path_data_dir ? '/' : '';

	options.db = options.db || {
		"driver": "sqlite",
		"database": options.path_data_dir + 'database.sqlite'
	};
	this.get_options = function(){
		return options;
	}



	// データベースの初期化
	const dba = new (require('./db/dba.js'))( this );



	/**
	 * 探索の開始地点を登録する
	 */
	this.add_target_url = async function(url, method, request_options){
		if( !url ){
			return false;
		}
		if( !method ){
			method = 'GET';
		}
		request_options = request_options || {};
		request_options.headers = request_options.headers || {};
		request_options.body = request_options.body || '';

		var parsedUrl = parseUrl(url);

		await dba.insert_new_url(
			parsedUrl.scheme,
			parsedUrl.host,
			parsedUrl.path,
			method,
			request_options.headers,
			request_options.body
		);
		return true;
	}


	/**
	 * クローリングを開始する
	 */
	this.crawl = function( callback ){
		// データベースの初期化
		const crawler = new (require('./crawler/crawler.js'))( this, dba );
		return crawler.start();
	}


	/**
	 * URLを解析する
	 */
	function parseUrl(url){
		let rtn = {};
		var parsedUrl = new URL(url);
		rtn.scheme = parsedUrl.protocol;
		rtn.host = parsedUrl.host;
		rtn.path = parsedUrl.pathname;
		if( rtn.scheme ){
			rtn.scheme = rtn.scheme.replace( /\:$/, '');
		}
		return rtn;
	}

}
