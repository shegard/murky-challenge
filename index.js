var http = require('http');


var s = http.createServer(function (req, res) {
	
			res.writeHead(200, {'Content-Type': 'text\html'});
			
			res.end('Hello world', 'utf-8');
	
      
});

s.listen(5000);
