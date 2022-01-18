import { HealerOptions, ServerOptions } from '../models';
import { colors, error, print, success } from '../output';
import { elementEndpoint } from './enpoints';
import { healEndpoint } from './enpoints/heal-endpoint';
import { WSServer, wsServer } from './server';

let server: WSServer = null;

const initServer = ( { port }: ServerOptions, healer: HealerOptions ): void => {
    server = wsServer( ( req, resp, err ) => {
        error( `Error on request ${req?.path}: ${err.message || err}` );
    } );

    server.post( '/element', elementEndpoint );
    server.post( '/heal', healEndpoint( healer ) );

    server.listen( port, () => {
        success( `   The ${colors.magenta.bold( 'Healer' )} server is running. :) ` );
        print();
    } );
};

const closeServer = (): void => {
    server.close();
};

export { initServer, closeServer };
