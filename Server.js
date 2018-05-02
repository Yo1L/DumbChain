var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

module.exports = class Server {
    constructor(http_port, ws_port) {
        this.http_port = http_port;
        this.ws_port = ws_port;
        this.ws_sockets = [];

        this.http = express();
        this.ws = new WebSocket.Server({port: this.ws_port});
    }

    startHTTP() {
        this.http.use(bodyParser.json);

        this.http.get('/', (req, res) => {
            res.send("hello world");
        });

        this.http.listen(this.http_port, () => {
            console.log("Ready to listen on port:" + this.http_port)
        });
    }

    startWS() {
        this.ws.on('connection', ws => {
            var vm = this;
            this.ws_sockets.push(new WSClient(ws, (ws, message) => {
                switch (message.type) {
                    case MessageType.QUERY_LATEST:
                        //write(ws, responseLatestMsg());
                        break;
                    case MessageType.QUERY_ALL:
                        //write(ws, responseChainMsg());
                        break;
                    case MessageType.RESPONSE_BLOCKCHAIN:
                        //handleBlockchainResponse(message);
                        break;
                }
            },
            ws => {
                vm.ws_sockets.splice(vm.ws_sockets.indexOf(ws), 1);
            }))
        });
    }

    start() {
        this.startHTTP();
        this.startWS();
    }
}