var app = require('./app');
var http = require('http');

http.createServer(app).listen(process.env.port || 15301);
