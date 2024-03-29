module.exports = function( options ){
	const utils79 = require('utils79');
	const it79 = require('iterate79');
	const fsEx = require('fs-extra');


	// options の検査と整形
	options = options || {};
	options.user_id = options.user_id || null;
	options.project_id = options.project_id || null;
	options.user_agent = options.user_agent || '';
	options.ranges = options.ranges || [];
	options.ignores = options.ignores || [];
	options.path_data_dir = options.path_data_dir || '.lotus-crawler/';

	// データディレクトリの初期化
	if( !fsEx.existsSync(options.path_data_dir) ){
		if( !fsEx.mkdirSync(options.path_data_dir) ){
			console.error('Failed to mkdir:', options.path_data_dir);
		}
	}

	options.path_data_dir = utils79.normalize_path(fsEx.realpathSync(options.path_data_dir));
	options.path_data_dir += options.path_data_dir ? '/' : '';

	options.db = options.db || {};
	options.db.driver = options.db.driver || "sqlite";
	options.db.database = options.db.database || options.path_data_dir + 'database.sqlite';
	options.db.prefix = (options.db.prefix ? options.db.prefix : '');
	this.get_options = function(){
		return options;
	}



	// データベースの初期化
	const dba = new (require('./db/dba.js'))( this );
	this.dba = function(){ return dba };


	/**
	 * URLを解析する
	 */
	function parseUrl(url){
		let rtn = {};
		let parsedUrl = new URL(url);

		rtn.scheme = parsedUrl.protocol;
		rtn.host = parsedUrl.host;
		rtn.path = parsedUrl.pathname + parsedUrl.search;
		if( rtn.scheme ){
			rtn.scheme = rtn.scheme.replace( /\:$/, '');
		}
		return rtn;
	}



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
		method = method.toUpperCase();
		let headers = {};
		headers["user-agent"] = options.user_agent;
		request_options = request_options || {};
		request_options.headers = request_options.headers || {};
		request_options.headers = Object.assign(request_options.headers, headers);

		request_options.body = request_options.body || '';

		var parsedUrl = parseUrl(url);

		await this.dba().insert_new_url(
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
	this.crawl = function(){
		const crawler = new (require('./crawler/crawler.js'))( this );
		return crawler.start();
	}


	/**
	 * 収集したデータをファイルに出力する
	 */
	this.export = function( path_export_to, export_options ){
		export_options = export_options || {};

		const exporter = new (require('./exporter/exporter.js'))( this );
		return exporter.start( path_export_to, export_options );
	}


	/**
	 * レコード総数を取得する
	 */
	this.count = function(){
		return this.dba().CrawlingUrl.count({
			where: {
				user_id: options.user_id,
				project_id: options.project_id,
			}
		});
	}


	/**
	 * each
	 */
	this.each = function( eachFnc ){
		const main = this;

		return new Promise( (rlv, rjt) => {
			let targetList;
			it79.fnc({}, [
				function(it1){
					main.dba().CrawlingUrl.findAll({
						attributes: [
							// カラムには、base64などが含まれ、かなりの大容量になる。
							// 一覧にそれを含むには大きすぎるので、取得するカラムを絞る。
							'id',
							'host',
							'path',
							'request_method'
						],
						where: {
							user_id: options.user_id,
							project_id: options.project_id,
						}
					}).then( (result) => {
						targetList = result;
						it1.next();
					} );
				},
				function(it1){
					it79.ary(
						targetList,
						function(itAry, row){

							main.dba().CrawlingUrl.findOne({
								where: {
									id: row.id,
									user_id: options.user_id,
									project_id: options.project_id,
								}
							}).then( (urlInfo) => {
								eachFnc(urlInfo, function(){
									itAry.next();
								});
							} );
						},
						function(){
							it1.next();
						}
					);
				},
				function(){
					rlv();
				}
			]);
		} );
	}


	/**
	 * リンクに指定された文字列をリンク先の完全なURIに変換する
	 */
	this.resolveLinkToUri = function( baseUri, linkTo ){
		if( linkTo.match(/^[a-z0-9]+\:/i) ){
			// リンク先が完全なURIである場合、加工は必要ない。
			return linkTo;
		}

		if( !baseUri.match(/^[a-z0-9]+\:/i) ){
			// リンク元が完全なURIではない場合、計算できない。
			console.error('[Error] resolveLinkToUri: Base URL is NOT a URI.');
			return false;
		}

		const path = require('path');
		const parsedUrl_base = new URL(baseUri);
		// console.log(parsedUrl_base);

		if( linkTo.match(/^\/\//i) ){
			// `//` で始まる場合
			return parsedUrl_base.protocol + linkTo;

		}else if( linkTo.match(/^\//i) ){
			// `/` で始まる場合
			return parsedUrl_base.origin + linkTo;

		}

		// その他の相対パス
		let dirname = parsedUrl_base.pathname;
		if( !parsedUrl_base.pathname.match(/\/$/) ){
			// スラッシュで閉じられていない
			dirname = utils79.dirname( parsedUrl_base.pathname );
		}
		return parsedUrl_base.origin + utils79.normalize_path(path.resolve('/', dirname, linkTo));
	}


	/**
	 * URLが探索範囲外か調べる
	 */
	this.isUrlIgnored = function( url ){
		let result = true;
		for( let idx = 0; idx < options.ranges.length; idx ++ ){
			if( url.indexOf(options.ranges[idx]) === 0 ){
				result = false;
				break;
			}
		}
		if( result ){
			// ホワイトリストにマッチしなければ対象外
			return true;
		}

		result = false;
		for( let idx = 0; idx < options.ignores.length; idx ++ ){
			if( url.indexOf(options.ignores[idx]) === 0 ){
				result = true;
				break;
			}
		}

		return result;
	}

}
