var http = require('http');
const fs = require('fs').promises;

var server = http.createServer(function (req, res) {   // create web server
    if (req.url == '/') {   // 127.0.0.1:5000
        res.writeHead(200, { 'Content-Type': 'text/html' }); 
        res.write('<html><body><p>Greetings Token Minter! I\'ll be your server today.</p><p><a href="./fcl">Upload Assets</a></p></body></html>');
        res.end();
    }
    else if ( req.url.match( /^\/fcl[\/]*$/ ) ) {  // e.g. localhost:5000/fcl
        fs.readFile(__dirname + "/public/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end( contents );
        })
        .catch(err => {
            res.end( JSON.stringify(err) );
            return;
        });
    }
    else { // else open file and return as javascript
        fs.readFile(__dirname + req.url )
        .then(contents => {
            res.setHeader("Content-Type", "text/javascript");
            res.writeHead( 200 );
            res.end( contents );
        })
        .catch(err => {
            res.end( JSON.stringify(err) );
            return;
        });
    }
});

server.listen(5000);
console.log('Node.js web server at port 5000 is running.. from dir '+__dirname )