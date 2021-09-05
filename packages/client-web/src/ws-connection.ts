import WebSocket from 'ws';

class WSConnection {
    private socketQueueId: number = null;
    private socketQueue: Record<string, ( data: any ) => void> = {};

    private socket: WebSocket = null;

    constructor( url: string, WSSocket: any = WebSocket ) {
        this.socket = new WSSocket( url );
        this.registerOnMessage();
    }

    async send( data: any, callback?: ( data: any ) => void ): Promise<void> {
        const hasCallback = typeof callback === 'function';
        let cmd: string = null;

        if ( hasCallback ) {
            this.socketQueueId++;

            cmd = `cmd_${this.socketQueueId}`;
            this.socketQueue[ cmd ] = callback;
        }

        const jsonData = JSON.stringify( {
            cmd: cmd || undefined,
            ...data,
        } );

        ( await this.getSocket() ).send( jsonData );
    }

    private getSocket(): Promise<WebSocket> {
        if ( this.socket.readyState === WebSocket.OPEN ) {
            return Promise.resolve( this.socket );
        }

        return new Promise( ( resolve ) => {
            this.socket.onopen = () => {
                resolve( this.socket );
            };
        } );
    }

    private registerOnMessage(): void {
        this.socket.onmessage = ( event ) => {
            const data = JSON.parse( event.data.toString() );
            const { cmd } = data;

            if ( cmd && this.socketQueue[ cmd ] ) {
                const callback = this.socketQueue[ cmd ];

                callback( data.result );
                delete this.socketQueue[ cmd ];
            }
        };
    }
}

export default WSConnection;
