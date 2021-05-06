module.exports = function( main ){
	const { Sequelize, DataTypes, Model } = require('sequelize');
	let options = main.get_options();
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
		logging: (...msg) => console.log(msg),
	});


	// --------------------------------------
	// Models: Crawling Url
	class CrawlingUrl extends Model {}
	CrawlingUrl.init({
		// 使用者識別情報
		"user_id": {
			type: DataTypes.STRING,
		},
		"project_id": {
			type: DataTypes.STRING,
		},

		// URLスキーマ
		// 例: http, https
		"scheme": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// ホスト名
		// ポート番号が指定される場合はそれも含む
		// 例: example.com
		// 例: example.com:3000
		// 例: user:passwd@example.com:3000
		"host": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// パス名
		// Getパラメータがある場合はそれも含む
		// 例: /foobar.html
		// 例: /foobar.html?a=b&c=d
		"path": {
			type: DataTypes.STRING,
			allowNull: false
		},

		// リクエストヘッダ
		"request_header": {
			type: DataTypes.STRING,
		},

		// リクエストメソッド
		"request_method": {
			type: DataTypes.STRING,
		},

		// リクエストボディ
		"request_body": {
			type: DataTypes.TEXT,
		},

		// 状態
		// - null = 未取得
		// - progress = 実行中
		// - done = 取得済み
		"status": {
			type: DataTypes.STRING,
		},

		// リクエスト日時
		"request_datetime": {
			type: DataTypes.DATE,
		},

		// レスポンスヘッダ
		"response_header": {
			type: DataTypes.STRING,
		},

		// レスポンスステータスコード
		"response_status": {
			type: DataTypes.INTEGER,
		},

		// レスポンスボディ(base64)
		"response_body_base64": {
			type: DataTypes.TEXT,
		},

		// レスポンスサイズ
		"response_body_size": {
			type: DataTypes.INTEGER,
		},

		// レスポンスタイム (sec)
		"response_time": {
			type: DataTypes.FLOAT,
		},
	}, {
		sequelize,
		modelName: 'CrawlingUrl',
	});
	CrawlingUrl.sync();

}
