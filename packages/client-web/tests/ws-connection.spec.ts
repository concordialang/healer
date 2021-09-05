import { expect } from 'chai';
import { Server, WebSocket } from 'mock-socket';

import WSConnection from '../src/ws-connection';

describe( 'WS Connection', () => {
    const url: string = 'ws://localhost:5000';

    let server: Server = null;

    beforeEach( () => {
        server = new Server( url );
    } );

    afterEach( () => {
        server.close();
    } );

    it( 'Should connect to server and close connection', ( done ) => {
        server.on( 'connection', () => done() );

        const socket = new WSConnection( url, WebSocket );

        expect( socket ).to.be.not.null;
    } );

    it( 'Should send data to server', ( done ) => {
        server.on( 'connection', ( socket ) => {
            socket.on( 'message', ( message ) => {
                const data = JSON.parse( message.toString() );

                expect( data.cmd ).to.be.undefined;

                done();
            } );
        } );

        const socket = new WSConnection( url, WebSocket );

        socket.send( {
            action: '/element',
            payload: {
                id: 'id',
            },
        } );
    } );

    it( 'Should send data to server an wait for response', ( done ) => {
        server.on( 'connection', ( socket ) => {
            socket.on( 'message', ( message ) => {
                const data = JSON.parse( message.toString() );

                expect( data.cmd ).to.be.not.undefined;

                if ( data.cmd ) {
                    socket.send(
                        JSON.stringify( {
                            cmd: data.cmd,
                        } ),
                    );
                }
            } );
        } );

        const socket = new WSConnection( url, WebSocket );

        socket.send(
            {
                action: '/element',
                payload: {
                    id: 'id',
                },
            },
            () => done(),
        );
    } );
} );
