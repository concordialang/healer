import { Server } from 'ws';

type Data = {
    action: string;
    payload: any;
};

type Request = { path?: string; body?: any };

type Response = { send: ( data: any ) => void };

type RequestListener = ( req: Request, res: Response ) => void | Promise<void>;

type RequestError = ( req: Request, res: Response, error: Error ) => void;

type Endpoint = {
    action: string;
    listener: RequestListener;
};

type WSServer = {
    post: ( path: string, listener: RequestListener ) => void;
    listen: ( port: number, listener: () => void ) => void;
};

const isData = ( data: any ): boolean => {
    return data?.action;
};

const parseData = ( dataStr: string, onError: ( error: Error ) => void ): Data => {
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

const requestError: RequestError = ( req, res, error ) => {
    res.send( error?.message || error );
};

const wsServer = ( onError: RequestError = requestError ): WSServer => {
    const endpoints: Endpoint[] = [];
    let server: Server = null;

    const initServer = ( port: number, listener: () => void ): void => {
        server = new Server( {
            port,
        } );

        server.on( 'connection', ( socket ) => {
            socket.on( 'message', async ( data ) => {
                const response: Response = {
                    send: ( message ) => socket.send( message ),
                };
                const onParserError = ( err: Error ): void => onError( {}, response, err );
                const { action, payload } = parseData( data.toString(), onParserError );
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
        listen: ( port: number, listener: () => void ) => {
            initServer( port, listener );
        },
    };
};

export { wsServer, Request, Response, RequestListener, RequestError };
