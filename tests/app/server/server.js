/**
 * server.js
 */
const fs = require('fs');
const path = require('path');
const utils79 = require('utils79');
const express = require('express'),
	app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');

app.use( bodyParser({"limit": "1024mb"}) );
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


// 静的なファイル群
app.use( express.static( __dirname+'/../vhosts/localhost_3000/' ) );

// 動的なレスポンスを返すサンプル
app.get('/dynamic_page', function (req, res) {
	let resBody = '';
	resBody += '<!DOCTYPE html>'+"\n";
	resBody += '<html>'+"\n";
	resBody += '<body>'+"\n";
	resBody += '<p>UserAgent: <code>'+req.headers['user-agent']+'</code></p>'+"\n";
	resBody += '</body>'+"\n";
	resBody += '</html>'+"\n";
	res.set('Content-Type', 'text/html');
	res.status(200);
	res.send(resBody);
})

// 3000番ポートでLISTEN状態にする
server.listen( 3000, function(){
	console.log('server-standby');
} );
