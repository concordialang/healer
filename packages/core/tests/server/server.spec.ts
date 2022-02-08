import { expect } from 'chai';
import WebSocket from 'ws';

import { WSServer, wsServer } from '../../src/server/server';

describe( 'Server', () => {
    const testPort = 5000;
    let server: WSServer = null;

    it( 'Should server and listening on specific port', ( done ) => {
        server = wsServer( ( req, res, error ) => res.send( { error: error.message } ) );

        server.listen( testPort, 'localhost', () => {
            done();
        } );
    } );

    it( 'Should receive a message in post', ( done ) => {
        const action: string = '/test';
        const payload: string = 'test';

        server.post( action, ( req ) => {
            expect( req.body ).to.be.equals( payload );

            done();
        } );

        const ws = new WebSocket( `ws://localhost:${testPort}` );

        ws.on( 'open', () => {
            ws.send(
                JSON.stringify( {
                    action,
                    payload,
                } ),
            );
            ws.close();
        } );
    } );

    it( 'Should return a error message', ( done ) => {
        const action: string = '/error-test';
        const payload: string = 'error-test';
        const error = new Error( 'Error message' );

        server.post( action, ( req ) => {
            expect( req.body ).to.be.equals( payload );

            throw error;
        } );

        const ws = new WebSocket( `ws://localhost:${testPort}` );

        ws.on( 'open', () => {
            ws.send(
                JSON.stringify( {
                    action,
                    payload,
                } ),
            );
        } );

        ws.on( 'message', ( data ) => {
            expect( JSON.parse( data.toString() ).result.error ).to.be.equals( error.message );

            ws.close();

            done();
        } );
    } );

    it( 'Should close server', ( done ) => {
        server.close();

        done();
    } );
} );
