const assert = require('assert');
const fsEx = require('fs-extra');
const LotusCrawler = require(__dirname + '/../node/main.js');
const lotus = new LotusCrawler({
	user_agent: 'Mozilla/5.0 Test Agent',
	ranges: [
		'http://127.0.0.1:3000/',
		'http://127.0.0.1:3001/',
		'http://127.0.0.1:3002/'
	],
	db: {
		prefix: 'LotusCrawlerTest',
	},
});
let serverProc;

describe('Starting test server', function() {

	it("Server Start", function(done) {
		this.timeout(60*1000);
		serverProc = require('child_process').spawn('node', [__dirname + '/app/server/server.js']);
		serverProc.stdout.on('data', function(data){
			console.log(data.toString());
		});
		serverProc.stderr.on('data', function(data){
			console.error(data.toString());
		});
		serverProc.on('close', function(code){
			console.log('------ server closed with:', code);
		});
		setTimeout(function(){
			done();
		}, 1000);
	});

});

describe('Functions', function() {

	it("lotus.resolveLinkToUri()", function(done) {
		this.timeout(60*1000);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/test/b/c.html',
				'./index.html'
			),
			'https://hoge/test/b/index.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/test/b/c.html',
				'/fin/index.html'
			),
			'https://hoge/fin/index.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/test/b/c.html?a=b&c=d',
				'/fin/index.html'
			),
			'https://hoge/fin/index.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/test/b/c.html',
				'http://foobar/'
			),
			'http://foobar/'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/test/b/c.html',
				'//foobar/'
			),
			'https://foobar/'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge:3000/test/b/c.html',
				'/foobar/'
			),
			'https://hoge:3000/foobar/'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge:3000/test/b/c.html',
				'//foobar:9999/'
			),
			'https://foobar:9999/'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/',
				'./hoge/fuga.html'
			),
			'https://hoge/hoge/fuga.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge/',
				'../../../hoge/fuga.html'
			),
			'https://hoge/hoge/fuga.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge',
				'./hoge/fuga.html'
			),
			'https://hoge/hoge/fuga.html'
		);
		assert.equal(
			lotus.resolveLinkToUri(
				'https://hoge',
				'../../../hoge/fuga.html'
			),
			'https://hoge/hoge/fuga.html'
		);
		done();
	});

	it("lotus.isUrlIgnored()", function(done) {
		this.timeout(60*1000);
		assert.equal( false, lotus.isUrlIgnored('http://127.0.0.1:3000/') );
		assert.equal( false, lotus.isUrlIgnored('http://127.0.0.1:3000/hoge/fuga/') );
		assert.equal( false, lotus.isUrlIgnored('http://127.0.0.1:3001/') );
		assert.equal( false, lotus.isUrlIgnored('http://127.0.0.1:3001/hoge/fuga/') );
		assert.equal( true, lotus.isUrlIgnored('https://127.0.0.1:3000/') );
		assert.equal( true, lotus.isUrlIgnored('https://127.0.0.1:3000/hoge/fuga/') );
		assert.equal( true, lotus.isUrlIgnored('http://127.0.0.1:3010/') );
		assert.equal( true, lotus.isUrlIgnored('http://127.0.0.1:3010/hoge/fuga/') );
		done();
	});

});

describe('Crawling', function() {

	it("Creating Instance", function(done) {
		this.timeout(60*1000);
		assert.equal(typeof(lotus), typeof({}));
		done();
	});

	it("Adding Target URL", function(done) {
		this.timeout(60*1000);
		lotus.add_target_url('http://127.0.0.1:3000/')
			.then(result => {
				assert.equal(result, true);
				done();
			});
	});

	it("Crawling", function(done) {
		this.timeout(60*1000);
		lotus.crawl()
			.then(() => {
				done();
			})
			.catch((message) => {
				console.error(message);
				done();
			});
	});
});

describe('Exporting', function() {

	it("Crawling", function(done) {
		this.timeout(60*1000);
		lotus.export(__dirname + '/app/export/', {
		})
			.then(() => {
				done();
			})
			.catch((message) => {
				console.error(message);
				done();
			});
	});

});

describe('Shutting down test server', function() {

	it("Server Stop", function(done) {
		process.kill(serverProc.pid);
		setTimeout(function(){
			done();
		}, 10);
	});

	it("(Remove SQLite database)", function(done) {
		this.timeout(60*1000);
		let pathSqliteDb = __dirname + '/../.lotus-crawler/database.sqlite';
		try{
			if( fsEx.existsSync(pathSqliteDb) ){
				// let result = fsEx.unlinkSync(pathSqliteDb);
				// console.log('removing database:', result);
			}
		}catch(e){
			console.error(e);
		}
		setTimeout(function(){
			done();
		}, 1000);
	});

});
