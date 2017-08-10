var http = require('http');
var fs = require('fs');
var pg = require('pg');


var s = http.createServer(function (req, res) {
	console.log(req.url);

	let name = req.url.substr(1);
	if (!name) {
		name = 'index.html';
	}
	let ext = name.substr(name.lastIndexOf('.') + 1);

	if (ext == 'db') {
		if (process.env.DATABASE_URL) {

			res.writeHead(200, { 'Content-Type': 'text/html' });

			const pool = new pg.Pool({
				connectionString: process.env.DATABASE_URL,
			});

			pool.query('select table_name from information_schema.tables where table_schema like "public";', (err, r) => {
				res.end(`<p>console.log(${JSON.stringify(r)});</p>`);
				pool.end();
			});

		}
		else {

			console.log('hi');
			res.statusCode = 404;
			res.end();

		}
	}
	else {
		let sup_ext = { 'html': 'text/html', 'css': 'text/css', 'js': 'text/javascript', 'ico': 'image/x-icon' };

		if (sup_ext[ext]) {
			fs.readFile(name, function (err, data) {

				res.writeHead(200, { 'Content-Type': sup_ext[ext] });

				res.end(data, 'utf-8');
			});
		}
		else {
			console.log('Unknown extention: ' + ext);
			res.writeHead(404, 'not found', { 'Content-Type': 'text/html' });
			res.end('boo');
		}
	}
});

s.listen(process.env.PORT || 8080);
