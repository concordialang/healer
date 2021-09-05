import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import getXPath from '../src';

describe( 'Get XPath', () => {
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

    describe( 'With false optimized', () => {
        it( 'for element', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            document.body.appendChild( div );

            const xpath = getXPath( div, false );

            expect( xpath ).to.be.equals( '/html/body/div' );
        } );

        it( 'for single leaf element', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span = document.createElement( 'span' );
            const button = document.createElement( 'button' );

            div.appendChild( span );
            span.appendChild( button );
            document.body.appendChild( div );

            const xpath = getXPath( button, false );

            expect( xpath ).to.be.equals( '/html/body/div/span/button' );
        } );

        it( 'leaf elements', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span = document.createElement( 'span' );
            const button1 = document.createElement( 'button' );
            const button2 = document.createElement( 'button' );

            div.appendChild( span );
            span.appendChild( button1 );
            span.appendChild( button2 );
            document.body.appendChild( div );

            let xpath = getXPath( button1, false );

            expect( xpath ).to.be.equals( '/html/body/div/span/button[1]' );

            xpath = getXPath( button2, false );

            expect( xpath ).to.be.equals( '/html/body/div/span/button[2]' );
        } );

        it( 'leaf elements inside parent with elements', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span1 = document.createElement( 'span' );
            const span1button1 = document.createElement( 'button' );
            const span1button2 = document.createElement( 'button' );
            const span2 = document.createElement( 'span' );
            const span2button = document.createElement( 'button' );

            div.appendChild( span1 );
            div.appendChild( span2 );
            span1.appendChild( span1button1 );
            span1.appendChild( span1button2 );
            span2.appendChild( span2button );
            document.body.appendChild( div );

            let xpath = getXPath( span1button2, false );

            expect( xpath ).to.be.equals( '/html/body/div/span[1]/button[2]' );

            xpath = getXPath( span2button, false );

            expect( xpath ).to.be.equals( '/html/body/div/span[2]/button' );
        } );
    } );

    describe( 'With true optimized', () => {
        it( 'for element', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            document.body.appendChild( div );

            const xpath = getXPath( div );

            expect( xpath ).to.be.equals( '//*[@id="test"]' );
        } );

        it( 'for single leaf element', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span = document.createElement( 'span' );
            const button = document.createElement( 'button' );

            div.appendChild( span );
            span.appendChild( button );
            document.body.appendChild( div );

            const xpath = getXPath( button );

            expect( xpath ).to.be.equals( '//*[@id="test"]/span/button' );
        } );

        it( 'leaf elements', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span = document.createElement( 'span' );
            const button1 = document.createElement( 'button' );
            const button2 = document.createElement( 'button' );

            div.appendChild( span );
            span.appendChild( button1 );
            span.appendChild( button2 );
            document.body.appendChild( div );

            let xpath = getXPath( button1 );

            expect( xpath ).to.be.equals( '//*[@id="test"]/span/button[1]' );

            xpath = getXPath( button2 );

            expect( xpath ).to.be.equals( '//*[@id="test"]/span/button[2]' );
        } );

        it( 'leaf elements inside parent with elements', () => {
            const div = document.createElement( 'div' );

            div.id = 'test';

            const span1 = document.createElement( 'span' );
            const span1button1 = document.createElement( 'button' );
            const span1button2 = document.createElement( 'button' );
            const span2 = document.createElement( 'span' );
            const span2button = document.createElement( 'button' );

            div.appendChild( span1 );
            div.appendChild( span2 );
            span1.appendChild( span1button1 );
            span1.appendChild( span1button2 );
            span2.appendChild( span2button );
            document.body.appendChild( div );

            let xpath = getXPath( span1button2 );

            expect( xpath ).to.be.equals( '//*[@id="test"]/span[1]/button[2]' );

            xpath = getXPath( span2button );

            expect( xpath ).to.be.equals( '//*[@id="test"]/span[2]/button' );
        } );
    } );
} );
