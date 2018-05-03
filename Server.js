const express = require("express");
const bodyParser = require('body-parser');
const WebSocket = require("ws");
const WSClient = require('./WSClient');
const Blockchain = require('./Blockchain');
const SyncError = require('./Errors/SyncError');

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

        this.blockchain = new Blockchain();
    }

    startHTTP() {
        var jsonParser = bodyParser.json();

        this.http.get('/', (req, res) => {
            res.send("hello world");
        });

        // Add a new peer
        // curl -d '{"peer":"ws://127.0.0.1:6001"}' localhost:3001/peer/add -H "Content-Type: application/json"
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

        // curl -d '{"data":"Bonjour"}' localhost:3001/mine -H "Content-Type: application/json"
        this.http.post('/mine', jsonParser, (req, res) => {
            if (!req.body && !req.body.data) {
                return res.sendStatus(400);
            }
            // compute a block from the data and append it to the blockchain
            this.blockchain.createBlock(req.body.data);
            // broacast the new block
            this.broadcastLastBlock();

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
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    wsClient.send(this.getLastBlockMessageResponse());
                    //write(wsClient.ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    //write(wsClient.ws, responseChainMsg());
                    wsClient.send(this.getAllBlocksMessageResponse());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    try {
                        if (this.blockchain.addBlocks(message.data)) {
                            // broadcast only if it has been appended
                            this.broadcastLastBlock();
                        }
                    }
                    catch(error) {
                        if (error instanceof SyncError) {
                            this.broadcastQueryAll();
                        }
                    }
                    break;
            }
        };

        wsClient.onDelete = wsClient => {
            vm.wsClients.splice(vm.wsClients.indexOf(wsClient), 1);
        };

        wsClient.send({
            type: MessageType.QUERY_LATEST
        });

        this.wsClients.push(wsClient);
    }

    getLastBlockMessageResponse() 
    {
        return {
            type: MessageType.RESPONSE_BLOCKCHAIN,
            data: [this.blockchain.getLastBlock()]
        };
    }

    getAllBlocksMessageResponse() 
    {
        return {
            type: MessageType.RESPONSE_BLOCKCHAIN,
            data: this.blockchain.getAllBlocks()
        };
    }

    broadcastLastBlock()
    {
        this.broadcast(this.getLastBlockMessageResponse());
    }

    broadcastQueryAll() 
    {
        this.broadcast({
            type: MessageType.QUERY_ALL
        });
    }

    broadcast(message) {
        console.log("Broadcasting:" + JSON.stringify(message));
        this.wsClients.forEach(wsClient => wsClient.send(message));
    }

    start() {
        this.startHTTP();
        this.startWS();
    }
}