import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import getElementData from '../src';

describe( 'Get Element Data', () => {
    const html = `
    <html>
        <body>
        </body>
    </html>
    `;

    beforeEach( () => {
        const jsdom = new JSDOM( html );
        const { window } = jsdom;

        global.document = window.document;
        global.Node = window.Node;
    } );

    it( 'Should get tag name from element', () => {
        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );

        document.body.appendChild( anchor );

        const data = getElementData( anchor );

        expect( data.tag ).to.be.not.null;
        expect( data.tag ).to.be.equals( 'a' );
    } );

    it( 'Should get inner text from element', () => {
        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );
        anchor.innerText = 'HOME';

        document.body.appendChild( anchor );

        const data = getElementData( anchor );

        expect( data.innerText ).to.be.not.undefined;
        expect( data.innerText ).to.be.equals( 'HOME' );
    } );

    it( 'Should get all attributes from element', () => {
        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );
        anchor.setAttribute( 'class', 'link link-item active' );
        anchor.setAttribute( 'href', 'http://localhost/test' );
        anchor.setAttribute( 'data-test', 'test' );

        document.body.appendChild( anchor );

        const data = getElementData( anchor );

        expect( data.attributes ).to.have.keys( 'id', 'class', 'href', 'data-test' );
        expect( data.attributes.id ).to.be.equals( 'home' );
        expect( data.attributes.class ).to.be.equals( 'link link-item active' );
        expect( data.attributes.href ).to.be.equals( 'http://localhost/test' );
        expect( data.attributes[ 'data-test' ] ).to.be.equals( 'test' );
    } );

    it( 'Should get xpath from element', () => {
        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );

        document.body.appendChild( anchor );

        const data = getElementData( anchor );

        expect( data.xpath ).to.be.not.null;
        expect( data.xpath ).to.be.equals( '/html/body/a' );
    } );

    it( 'Should get xpath from element', () => {
        const anchor = document.createElement( 'a' );

        anchor.setAttribute( 'id', 'home' );

        document.body.appendChild( anchor );

        const data = getElementData( anchor );

        expect( data.xpath ).to.be.not.null;
        expect( data.xpath ).to.be.equals( '/html/body/a' );
    } );
} );
