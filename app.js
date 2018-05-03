var CryptoJS = require("crypto-js");
var WebServer = require('./Server')


/**
 * HTTP Server
 */
const http_port = process.argv[2] || 3000;
const ws_port = process.argv[3] || 6000;

const app = new WebServer(http_port, ws_port);
app.start();

