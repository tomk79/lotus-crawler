module.exports = function( main ){
	const { Sequelize, DataTypes, Model } = require('sequelize');
	const options = main.get_options();
	let dba_options = {
		prefix: (options.db.prefix ? options.db.prefix+'_' : ''),
	};
	let connectionUri;

	switch( options.db.driver ){
		case "sqlite":
			connectionUri = options.db.driver + ':' + options.db.database;
			break;
		case "mysql":
		case "postgres":
		case "mariadb":
		case "mssql":
			connectionUri = options.db.driver + '://';
			if( options.db.username ){
				connectionUri += options.db.username;
				if( options.db.password ){
					connectionUri += ':' + options.db.password;
				}
				connectionUri += '@';
			}
			connectionUri += options.db.host;
			if( options.db.port ){
				connectionUri += ':' + options.db.port;
			}
			connectionUri += '/' + options.db.database;
			break;
	}


	// データベース接続の初期化
	console.log('Connect to database...', connectionUri);
	const sequelize = new Sequelize(connectionUri, {
		logging: (...msg) => {
			// console.log(msg)
		},
	});
	this.sequelize = sequelize;



	// --------------------------------------
	// Models: Crawling Url
	const CrawlingUrl = require('./models/CrawlingUrl.js')(main, dba_options, sequelize, Model, DataTypes);
	this.CrawlingUrl = CrawlingUrl;


	/**
	 * クロール対象URLに関する情報を取得する
	 */
	this.get_url_info = async function(scheme, host, path, method){
		let result = await CrawlingUrl.findAll({
			where: {
				user_id: options.user_id,
				project_id: options.project_id,
				scheme: scheme,
				host: host,
				path: path,
				request_method: method,
			}
		});
		// console.log('---------result:', result);
		if( result && result[0] ){
			return result[0];
		}
		return false;
	}

	/**
	 * クロール対象の新しいURLを挿入する
	 */
	this.insert_new_url = async function(scheme, host, path, method, req_headers, req_body){
		let record = await this.get_url_info(scheme, host, path, method);
		if( record ){
			return record.id;
		}

		let port = 80;
		if( host.match(/\:([0-9]*)$/) ){
			port = RegExp.$1;
		}else if( scheme == 'http' ){
			port = 80;
		}else if( scheme == 'https' ){
			port = 443;
		}

		let newRecord = await CrawlingUrl.create({
			"user_id": options.user_id,
			"project_id": options.project_id,
			"scheme": scheme,
			"host": host,
			"port": port,
			"path": path,
			"request_method": method,
			"request_headers": JSON.stringify(req_headers),
			"request_body": req_body,
		});
		// console.log('=-=-=-=-=-= inserted:', newRecord.id);
		return newRecord.id;
	}

}
