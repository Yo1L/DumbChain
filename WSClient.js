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
            console.log('Received message' + JSON.stringify(message));

            if (vm.onMessage) {
                vm.onMessage(vm, message);
            }
        });
    }

    initErrorHandler(onDelete) {
        if (this.onDelete) {
            this.ws.on('close', () => this.onDelete(this));
            this.ws.on('error', () => this.onDelete(this));
        }
    }

    send(message) {
        this.ws.send(JSON.stringify(message));
    }
}