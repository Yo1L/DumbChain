module.exports = class WSClient {
    constructor(ws, onMessage, onDelete) {
        this.ws = ws;
        this.initErrorHandler(onDelete);
        this.initMessageHandler(onMessage)
    }

    initMessageHandler(onMessage) {
        if (!onMessage) {
            return;
        }

        this.ws.on('message', (data) => {
            var message = JSON.parse(data);
            
            console.log('Received message' + JSON.stringify(message));

            onMessage(ws, message);
        });
    }

    initErrorHandler(onDelete) {
        if (onDelete) {
            this.ws.on('close', () => onDelete(ws));
            this.ws.on('error', () => onDelete(ws));
        }
    }
}