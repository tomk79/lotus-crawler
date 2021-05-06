module.exports = function( main ){
	const Sequelize = require('sequelize');
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
	const sequelize = new Sequelize(connectionUri);

}
