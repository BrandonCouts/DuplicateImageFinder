var Scanner = require('./scanner');

var scanner = new Scanner();
scanner.scanDirectory('./images/', function( hashes ){
	console.log( 'DONE !');
	console.log( hashes );
});