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
	resBody += '<p>Referer: <code>'+req.headers['referer']+'</code></p>'+"\n";
	resBody += '</body>'+"\n";
	resBody += '</html>'+"\n";
	res.set('Content-Type', 'text/html');
	res.status(200);
	res.send(resBody);
})

// リダイレクトするサンプル
app.get('/redirect/301from', function (req, res) {
	res.set('Content-Type', 'text/html');
	res.set('Location', '/redirect/301to.html');
	res.status(301);
	res.send('<p>301 Redirect</p>');
})
app.get('/redirect/302from', function (req, res) {
	res.set('Content-Type', 'text/html');
	res.set('Location', '/redirect/302to.html');
	res.status(302);
	res.send('<p>302 Redirect</p>');
})
app.get('/redirect/307from', function (req, res) {
	res.set('Content-Type', 'text/html');
	res.set('Location', '/redirect/307to.html');
	res.status(307);
	res.send('<p>307 Redirect</p>');
})
app.get('/redirect/308from', function (req, res) {
	res.set('Content-Type', 'text/html');
	res.set('Location', '/redirect/308to.html');
	res.status(308);
	res.send('<p>308 Redirect</p>');
})

// 3000番ポートでLISTEN状態にする
server.listen( 3000, function(){
	console.log('server-standby');
} );
