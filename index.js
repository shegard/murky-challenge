const http = require('http');
const fs = require('fs');
const pg = require('pg');
const qs = require('querystring');

let local_database_url = undefined;

/*
const pool = new pg.Pool({
		connectionString: process.env.DATABASE_URL || local_database_url,
	});
let tables = [];
if (process.env.DATABASE_URL || local_database_url) {
	
	
	pool.query("select table_name from information_schema.tables where table_schema like 'public'", (error, result) => {
		if (!error) {
			let table_list = result.rows;
			for (let table in table_list) {
				tables.push(table_list[table].table_name);	
			}
		}
		pool.end();
	});
}	
*/

const s = http.createServer(function (req, res) {
	console.log('☻ URL: ' + req.url);

	let name = req.url.substr(1);
	if (!name) {
		name = 'index.html';
	}
	let ext = name.substr(name.lastIndexOf('.') + 1);

	if (req.method == 'GET') {

		let sup_ext = {
			'html': 'text/html',
			'css': 'text/css',
			'js': 'text/javascript',
			'ico': 'image/x-icon',
			'db': 'text/html'
		};
		
		if (name == 'simple_query.db') {
			simple_query(req, res);
		}
		else {
			if (ext == 'db') {
				name = 'database.html';
			}
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

	} else if (req.method == 'POST') {

		if (ext == 'test') {

			let x = '';
			req.on('data', function (data) {
				x += data;
			});
			req.on('end', function () {
				x = JSON.parse(x);
			
				const pool = new pg.Pool({
					connectionString: process.env.DATABASE_URL || local_database_url,
				});
				pool.query(`create table if not exists ${x.login}_actions \
					(github_user text, target text, time text)`, function (error, result) {
				
					/*
					if (!tables.indexOf(x.login))
						console.log(`successfully created table ${x.login}_actions`);
					else
						console.log(`table ${x.login}_actions already exists`);
					*/

					pool.query(`insert into ${x.login}_actions values \
						('${x.login}', '${x.target}', '${x.time}')`, function (error, result) {
						
						pool.end();
					});
					pool.end();
				});
			
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(x + ' recieved!');
			});

		} else if (ext == 'db') {
			if (name == 'simple_query.db') {
				simple_query(req, res);
			}
			else {
				
				req.on('data', function () {
					// need!				
				});
			
				req.on('end', function () {
					const pool = new pg.Pool({
						connectionString: process.env.DATABASE_URL || local_database_url,
					});
					let user = name.substring(0, name.indexOf('.'));
					pool.query(`select * from ${user}`, function (error, result) {
						res.writeHead(200, { 'Content-Type': 'application/json' });
						res.end(JSON.stringify(result, null, 2));
						pool.end();
					})
				
				});
			}	
		}
		
	} else {
		res.statusCode = 405;
		res.end('not so fast');
	}

});

s.listen(process.env.PORT || 8080);


// this function makes possible to input queries to database on page /simple_query.db
// just executes queries and displays result as text
function simple_query(req, res) {
	if (req.method == 'GET') {
			
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write('<form method="post"><div><label for="label">Query:</label>\
			<input type="txt" id="label" name="query" value="" /></div><input type="submit" /></form>');
		res.end();
	}
	else if (req.method == 'POST') {

		let x = '';
		req.on('data', function (data) {
			x += data;
		});
		req.on('end', function (data) {
			if (process.env.DATABASE_URL || local_database_url) {

				res.writeHead(200, { 'Content-Type': 'text/plain' });

				const pool = new pg.Pool({
					connectionString: process.env.DATABASE_URL || local_database_url,
				});
				pool.query(qs.parse(x).query, (err, r) => {
					res.end(`error: ${JSON.stringify(err)}\nquery: ${JSON.stringify(r, null, 2)}`);
					pool.end();
				});
					
			}
			else {

				res.statusCode = 200;
				res.end();

			}
		});
	}
}