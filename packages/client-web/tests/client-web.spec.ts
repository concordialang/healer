import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { Server, WebSocket } from 'mock-socket';

import ClientWeb from '../src/client-web';
import WSConnection from '../src/ws-connection';

describe( 'Client Web', () => {
    const url: string = 'ws://localhost:5000';

    const html = `
    <html>
        <body>
        </body>
    </html>
    `;

    let server: Server = null;

    beforeEach( () => {
        server = new Server( url );

        const jsdom = new JSDOM( html );
        const { window } = jsdom;

        global.document = window.document;
        global.Node = window.Node;
    } );

    afterEach( () => {
        server.close();
    } );

    it( 'Should send element to save', ( done ) => {
        server.on( 'connection', ( socket ) => {
            socket.on( 'message', ( message ) => {
                const data = JSON.parse( message.toString() );

                expect( data.action ).to.be.equals( '/element' );
                expect( data.payload ).to.be.not.null;
                expect( data.payload.tag ).to.be.equals( 'a' );
                expect( data.payload.attributes ).to.have.keys( 'id' );
                expect( data.payload.attributes.id ).to.be.equals( 'home' );
                expect( data.payload.xpath ).to.be.equals( '/html/body/a' );
                expect( data.payload.parents ).to.have.length( 2 );
                expect( data.payload.parents[ 0 ].tag ).to.be.equals( 'body' );
                expect( data.payload.parents[ 1 ].tag ).to.be.equals( 'html' );

                done();
            } );
        } );

        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );

        document.body.appendChild( anchor );

        const client = new ClientWeb( new WSConnection( url, WebSocket ) );

        client.saveElement( anchor );
    } );

    it( 'Should request a healing method', async () => {
        server.on( 'connection', ( socket ) => {
            socket.on( 'message', ( message ) => {
                const data = JSON.parse( message.toString() );

                expect( data.cmd ).to.be.equals( 'cmd_1' );
                expect( data.action ).to.be.equals( '/heal' );
                expect( data.payload ).to.be.not.null;
                expect( data.payload.element.tag ).to.be.equals( 'a' );
                expect( data.payload.body ).to.be.string;

                const { document } = new JSDOM( data.payload.body ).window;

                const anchor = document.querySelectorAll( '.link.link-item' );

                expect( anchor ).to.have.length( 1 );

                socket.send(
                    JSON.stringify( {
                        cmd: data.cmd,
                        result: '.link.link-item',
                    } ),
                );
            } );
        } );

        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );
        anchor.setAttribute( 'class', 'link link-item' );

        document.body.appendChild( anchor );

        const client = new ClientWeb( new WSConnection( url, WebSocket ) );

        const result = await client.healElement( anchor, document.body );

        expect( result ).to.be.equals( '.link.link-item' );
    } );
} );
