const http = require('http');
const fs = require('fs');
const pg = require('pg');
const qs = require('querystring');

if (process.env.DATABASE_URL) {
	const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL,
	});
	let tables = [];
	pool.query("select table_name from information_schema.tables where table_schema like 'public'", (error, result) => {
		if (!error) {
			let table_list = result.rows;
			for (let table in table_list) {
				tables.push(table_list[table].table_name);	
			}
		}
		console.log('table list: ' + JSON.stringify(tables));
		pool.end();
	});
}	

const s = http.createServer(function (req, res) {
	console.log('☻ URL: ' + req.url);

	let name = req.url.substr(1);
	if (!name) {
		name = 'index.html';
	}
	let ext = name.substr(name.lastIndexOf('.') + 1);

	if (ext == 'db') {
		if (req.method == 'GET') {
			
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('<form method="post"><div><label for="label">Query:</label><input type="txt" id="label" name="query" value="" /></div><input type="submit" /></form>');
			res.end();
		}
		else if (req.method == 'POST') {
			
			let x = '';
			req.on('data', function (data) {
				x += data;
			});
			req.on('end', function (data) {
				console.log(qs.parse(x));
				if (process.env.DATABASE_URL) {

					res.writeHead(200, { 'Content-Type': 'text/html' });
					pool.query(qs.parse(x).query, (err, r) => {
						//res.write('<p>' + tables + JSON.stringify(tables) + '</p>');
						res.end(`<p>${JSON.stringify(err)}, ${JSON.stringify(r)}</p>`);
						pool.end();
					});
					
				}
				else {

				
					res.statusCode = 200;
					res.end();

				}
			});

		}
	} else if (ext == 'test') {

		let x = '';
		req.on('data', function (data) {
			x += data;
		});
		req.on('end', function () {
			x = JSON.parse(x);
			
			const pool = new pg.Pool({
				connectionString: process.env.DATABASE_URL,
			});
			pool.query(`create table if not exists ${x.login}_actions (github_user text, target text, time text)`, function (error, result) {
				const pool = new pg.Pool({
					connectionString: process.env.DATABASE_URL,
				});
				if (!tables.indexOf(x.login))
					console.log(`successfully created table ${x.login}_actions`);
				else
					console.log(`table ${x.login}_actions already exists`);
				pool.query(`insert into ${x.login}_actions values (${x.login}, ${x.target}, ${x.time})`, function (error, result) {
					console.log(`successfully added values into table ${x.login}_actions`);
					pool.end();
				})
				pool.end();
			})
			
			console.log('to_db: ' + JSON.stringify(x));
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(x + ' recieved!');
		});

	} else {

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
