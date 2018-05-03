var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");
var WSClient = require('./WSClient');

const MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

module.exports = class Server {
    constructor(httpPort, wsPort) {
        this.httpPort = httpPort;
        this.wsPort = wsPort;
        this.wsClients = [];

        this.http = express();
        console.log("WebSocket Server on port:" + this.wsPort);
        this.ws = new WebSocket.Server({port: this.wsPort});
    }

    startHTTP() {
        var jsonParser = bodyParser.json();

        this.http.get('/', (req, res) => {
            res.send("hello world");
        });

        // Add a new peer
        // curl -d '{"peer":"ws://127.0.0.1:6000"}' localhost:3000/peer/add -H "Content-Type: application/json"
        this.http.post('/peer/add', jsonParser, (req, res) => {
            if (!req.body && !req.body.peer) {
                return res.sendStatus(400);
            }
            var peer = req.body.peer;
            var ws = new WebSocket(peer);
            var vm = this;

            ws.on('open', () => {
                vm.addWSClient(ws);
            });
            ws.on('error', () => {
                console.log('Failed adding peer:' + peer);
            });

            return res.sendStatus(200);
        });

        // list peers
        this.http.get('/peer', (req, res) => {
            res.send(this.wsClients.map(s => s.ws._socket.remoteAddress + ':' + s.ws._socket.remotePort));
        });

        this.http.listen(this.httpPort, () => {
            console.log("HTTP on port:" + this.httpPort)
        });
    }

    startWS() {
        this.ws.on('connection', ws => {
            this.addWSClient(ws);
        });
    }

    addWSClient(ws) {
        var vm = this;

        var wsClient = new WSClient(ws);

        wsClient.onMessage = (wsClient, message) => {
            console.log(message);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    //write(wsClient.ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    //write(wsClient.ws, responseChainMsg());
                    wsClient.send("ALL BLOCKS");
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    //handleBlockchainResponse(message);
                    break;
            }
        };

        wsClient.onDelete = wsClient => {
            vm.wsClients.splice(vm.wsClients.indexOf(wsClient), 1);
        };

        wsClient.send({
            type: MessageType.QUERY_ALL
        });

        this.wsClients.push(wsClient);
    }

    broadcastWS(message) {
        this.wsClients.forEach(wsClient => wsClient.send(message));
    }

    start() {
        this.startHTTP();
        this.startWS();
    }
}