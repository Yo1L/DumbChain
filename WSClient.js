module.exports = class WSClient {
    constructor(ws, onMessage, onDelete) {
        this.ws = ws;
        this.onMessage = onMessage;
        this.onDelete = onDelete;

        this.initMessageHandler();
        this.initErrorHandler();
    }

    initMessageHandler() {
        var vm = this;
        this.ws.on('message', (data) => {
            var message = JSON.parse(data);
            console.log('Received message' + data);

            if (vm.onMessage) {
                vm.onMessage(vm, message);
            }
        });
    }

    initErrorHandler(onDelete) {
        var vm = this;
        var clean = () => {
            if (vm.onDelete) vm.onDelete(vm);
        }
        this.ws.on('close', () => clean());
        this.ws.on('error', () => clean());
    }

    send(message) {
        this.ws.send(JSON.stringify(message));
    }
}