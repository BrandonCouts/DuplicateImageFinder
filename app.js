var crypto = require('crypto');
var fs = require('fs');

var hashs = {};
var path = './images/';
var files = fs.readdirSync( path );

var stillRunning = files.length;

function done() {
	for( var hash in hashs )
		if( hashs.hasOwnProperty( hash ) )
			if( hashs[ hash ].length > 1 ) {
				console.log( 'Found duplicates: ' );
				for( var i = 0, duplicate = hashs[ hash ][ i ]; i < hashs[ hash ].length; duplicate = hashs[ hash ][ ++i ] ) {
					console.log( '\tPath:', duplicate.path );
					console.log( '\tmd5:', duplicate.hash );
					console.log( '\tSize:', Math.floor( duplicate.stats.size / 1024 ), 'kb' );
					//console.log( '\t', duplicate);
				}
			}
}

for( var i = 0; i < files.length; i++ ) {
	(function( path ){
		var hash = crypto.createHash('md5');
		var stream = fs.createReadStream( path );

		stream.on('data', function (data) {
			hash.update(data, 'utf8')
		});

		stream.on('end', function () {
			var result = {
				path: path
			};
			result.hash = hash.digest('hex');
			hashs[ result.hash ] = ( hashs[ result.hash ] ) ? hashs[ result.hash ] : [];
			hashs[ result.hash ].push( result );
			fs.lstat( path, function( err, stats ){
				result.stats = stats;
				if( ! --stillRunning )
					done();
			});
		});

		stream.on('error', function( err ) {
			console.log( err );
		});

	})( path + files[ i ] );
}