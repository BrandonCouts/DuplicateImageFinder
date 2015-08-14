var crypto = require('crypto');
var fs = require('fs');

function Scanner() {
}

Scanner.prototype.scanDirectory = function scanDirectory( directory, done ){
	done = ( typeof done == 'function' )? done : function(){ console.log('provide scanDirectory a callback function'); };

	var hashes = {};
	var files = fs.readdirSync( directory );

	var stillRunning = files.length;
	for( var i = 0; i < files.length; i++ ) {
		(function( path ){
			fs.lstat( path, function( err, stats ){

				if( stats.isFile() ) {
					var hash = crypto.createHash('md5');
					var stream = fs.createReadStream(path);
					var result = {
						path: path
					};

					stream.on('data', function (data) {
						hash.update(data, 'utf8')
					});

					stream.on('end', function () {
						hash = result.hash = hash.digest('hex');

						hashes[ hash ] = ( hashes[ hash ] ) ? hashes[ hash ] : [];
						hashes[ hash ].push(result);

						result.stats = stats;

						if ( ! --stillRunning ) done( hashes );
					});

					stream.on('error', function (err) {

						hashes['error'] = ( hashes['error'] )? hashes['error'] : [];
						hashes['error'].push( result );

						if ( ! --stillRunning ) done( hashes );
					});
				} else {
					if ( ! --stillRunning ) done( hashes );
				}
			});
		})( directory + files[ i ] );
	}
};
module.exports = Scanner;