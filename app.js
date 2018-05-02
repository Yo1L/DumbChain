var CryptoJS = require("crypto-js");
var WebServer = require('./Server')


/**
 * HTTP Server
 */
const http_port = 3000;
const ws_port = 3001;

const app = new WebServer(http_port, ws_port);
app.start();