var WebServer = require('./Server')


/**
 * HTTP Server
 */
const http_port = process.argv[2] || 3001;
const ws_port = process.argv[3] || 6001;

const app = new WebServer(http_port, ws_port);
app.start();

