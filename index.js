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
	
		var t = 'postgres://lnhlxeyjbmuulj:5bee12a96deb836d71c2c01f1e93625b637047722e1e819c16199e0227376dc9@ec2-23-21-85-76.compute-1.amazonaws.com:5432/df4dlfk18mdls';

		const pool = new pg.Pool({
			connectionString: t,
		});

		pool.query('select * from test_table', (err, r) => {
			res.end(`<script>console.log(${err}, ${r});</script>`);
			pool.end();
		});

		/*
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			res.write('<p>' + process.env.DATABASE_URL + '</p>');
			
			client.query('select * from test_table;', function (err, result) {
				done();
				if (err) {
					console.log(err.stack)
				} else {
					res.write(`<script>console.log(${result});</script>`);
					client.end();
				}
			});
			
		});
		*/
		//res.end('<p>' + process.env.DATABASE_URL + '</p>');
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
