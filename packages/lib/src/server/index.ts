import { colors, error, success } from '../output';
import { elementEndpoint } from './enpoints';
import { WSServer, wsServer } from './server';

type ServerOptions = {
    port: number;
};

let server: WSServer = null;

const initServer = ( { port }: ServerOptions ): void => {
    server = wsServer( ( req, resp, err ) => {
        error( `Error on request ${req.path}: ${err.message}` );
    } );

    server.post( '/element', elementEndpoint );

    server.listen( port, () => {
        success( `   The ${colors.magenta.bold( 'Healer' )} server is running. :) ` );
    } );
};

const closeServer = (): void => {
    server.close();
};

export { ServerOptions, initServer, closeServer };
