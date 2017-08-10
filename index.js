var http = require('http');
var fs = require('fs');
var pg = require('pg');


var s = http.createServer(function (req, res) {
	console.log(req.url);
	
	let name = req.url.substr(1);
	if(!name) 
	{
		name = 'index.html';
	}
	let ext = name.substr(name.lastIndexOf('.') + 1);
	
	if(ext == 'db') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('<p>' + process.env.DATABASE_URL + '</p>');
		
		
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			res.write('<p>' + process.env.DATABASE_URL + '</p>');
			done();
			client.query('select * from test_table;', function (err, result) {
				if (err) {
					console.log(err.stack)
				} else {
					res.write('<p>' +  + '</p>');
					client.end('<p>' + result + '</p>');
				}
			});
			res.end('<p>' + process.env.DATABASE_URL + '</p>');
		});
	}
	else {
		let sup_ext = {'html': 'text/html', 'css': 'text/css', 'js': 'text/javascript', 'ico': 'image/x-icon'};
		
		if(sup_ext[ext])
		{
			fs.readFile(name, function(err, data) {
				
				res.writeHead(200, {'Content-Type': sup_ext[ext]});
				
				res.end(data, 'utf-8');
			});
		}
		else
		{
			console.log('Unknown extention: ' + ext);
			//res.statusCode = 404;
			//res.end();
		}
	}
});

s.listen(process.env.PORT || 8080);
