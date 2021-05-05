const assert = require('assert');
const LotusRootCrawler = require(__dirname + '/../node/main.js');
let serverProc;

describe('Starting test server', function() {

	it("Server Start", function(done) {
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

describe('No Test', function() {

	it("No Test", function(done) {
		this.timeout(60*1000);

		let lotus = new LotusRootCrawler();

		assert.equal(typeof(lotus), typeof({}));
		done();
	});
});

describe('Shutting down test server', function() {

	it("Server Stop", function(done) {
		process.kill(serverProc.pid);
		setTimeout(function(){
			done();
		}, 10);
	});
});
