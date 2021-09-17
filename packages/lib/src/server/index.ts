import { HealerOptions } from '../models';
import { colors, error, success } from '../output';
import { elementEndpoint } from './enpoints';
import { healEndpoint } from './enpoints/heal-endpoint';
import { WSServer, wsServer } from './server';

type ServerOptions = {
    port: number;
    healer: HealerOptions;
};

let server: WSServer = null;

const initServer = ( { port, healer }: ServerOptions ): void => {
    server = wsServer( ( req, resp, err ) => {
        error( `Error on request ${req?.path}: ${err.message || err}` );
    } );

    server.post( '/element', elementEndpoint );
    server.post( '/heal', healEndpoint( healer ) );

    server.listen( port, () => {
        success( `   The ${colors.magenta.bold( 'Healer' )} server is running. :) ` );
    } );
};

const closeServer = (): void => {
    server.close();
};

export { ServerOptions, initServer, closeServer };
