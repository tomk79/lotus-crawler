const assert = require('assert');
const fsEx = require('fs-extra');
const LotusRootCrawler = require(__dirname + '/../node/main.js');
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

describe('Crawling', function() {
	const lotus = new LotusRootCrawler();

	it("Creating Instance", function(done) {
		this.timeout(60*1000);
		assert.equal(typeof(lotus), typeof({}));
		done();
	});

	it("Adding StartPage", function(done) {
		this.timeout(60*1000);
		lotus.add_start_page('http://127.0.0.1:3000/')
			.then(result => {
				assert.equal(result, true);
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
		let pathSqliteDb = __dirname + '/../.lotusroot-crawler/database.sqlite';
		try{
			if( fsEx.existsSync(pathSqliteDb) ){
				let result = fsEx.unlinkSync(pathSqliteDb);
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
