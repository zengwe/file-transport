import * as net from 'net';

export class Serve {
    handler: net.Server;
    clients: (net.Socket)[] = [];
    constructor(private option: {servePort: number}) {
        this.handler = net.createServer();
        this.handler.on('connection', (socket) => {
            this.clients.push(socket);
            socket.on('data', (data) => {
                // this.dataStream.write(data);
            });
        });
        this.handler.listen(option.servePort);
    }
    start() {

    }
    error() {

    }
    dataStream(clientId: string) {

    }
    close() {

    }
}