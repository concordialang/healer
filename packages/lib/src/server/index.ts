import { colors, error, success } from '../output';
import { initDatabase } from './database';
import { elementEndpoint } from './enpoints';
import { wsServer } from './server';

const initServer = ( port: number ): void => {
    const server = wsServer( ( req, resp, err ) => {
        error( `Error on request ${req.path}: ${err.message}` );
    } );

    server.post( '/element', elementEndpoint );

    server.listen( port, () => {
        success( `   The ${colors.magenta.bold( 'Healer' )} server is running. :) ` );
    } );
};

export { initServer, initDatabase };
