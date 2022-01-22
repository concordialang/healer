import { Server } from 'ws';

type Data = {
    cmd?: string;
    action: string;
    payload: any;
};

type Request = { path?: string; body?: any };

type Response = { send: ( data: any ) => void };

type RequestListener = ( req: Request, res: Response ) => void | Promise<void>;

type RequestError = ( req: Request, res: Response, error: any ) => void;

type Endpoint = {
    action: string;
    listener: RequestListener;
};

type WSServer = {
    post: ( path: string, listener: RequestListener ) => void;
    listen: ( port: number, host: string, listener: () => void ) => void;
    close: () => void;
};

const isData = ( data: any ): boolean => {
    return data?.action;
};

const parseData = ( dataStr: string, onError: ( error: any ) => void ): Data => {
    let data: any = null;

    try {
        data = dataStr && JSON.parse( dataStr );
    } catch ( err ) {
        onError( err );
    }

    if ( isData( data ) ) {
        return data;
    }

    return {
        action: '',
        payload: data,
    };
};

const wsServer = ( onError: RequestError ): WSServer => {
    const endpoints: Endpoint[] = [];
    let server: Server = null;

    const initServer = ( port: number, host: string, listener: () => void ): void => {
        server = new Server( {
            port,
            host,
        } );

        server.on( 'connection', ( socket ) => {
            socket.on( 'message', async ( data ) => {
                const onParserError = ( err: Error ): void => onError( null, null, err );
                const { cmd, action, payload } = parseData( data.toString(), onParserError );
                const endpoint = endpoints.find( ( value ) => {
                    return value.action === action;
                } );

                if ( !endpoint ) {
                    return;
                }

                const request: Request = {
                    path: action,
                    body: payload,
                };

                const response: Response = {
                    send: ( result ) => socket.send(
                        JSON.stringify( {
                            cmd,
                            result,
                        } ),
                    ),
                };

                try {
                    await endpoint.listener( request, response );
                } catch ( err ) {
                    onError( request, response, err );
                }
            } );
        } );

        server.on( 'listening', listener );
    };

    return {
        post: ( path: string, listener: RequestListener ) => {
            endpoints.push( {
                action: path,
                listener,
            } );
        },
        listen: ( port: number, host: string, listener: () => void ) => {
            initServer( port, host, listener );
        },
        close: () => {
            server.close();
        },
    };
};

export { wsServer, WSServer, Request, Response, RequestListener, RequestError };
