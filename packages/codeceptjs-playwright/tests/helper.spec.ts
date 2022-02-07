import { expect } from 'chai';
import proxyquire from 'proxyquire';

let onSaveElement: ( payload: any ) => void = null;

let onHealElement: ( payload: any ) => void = null;

const utils = proxyquire.noCallThru()
    .load( '../src/helper/utils', {
        '@concordialang-healer/client-web': {
            saveElement( payload: any ) {
                onSaveElement( payload );
            },
            healElement( payload: any ) {
                onHealElement( payload );
            },
        },
    } );

const Playwright = proxyquire( '../src/helper', {
    './utils': utils,
} );

describe( 'Playwright', () => {
    let I = null;

    before( async () => {
        I = new Playwright( {
            url: 'http://davertmik.github.io/angular-demo-app/#/',
            windowSize: '500x700',
            show: false,
            waitForTimeout: 5000,
            waitForAction: 500,
            restart: true,
            chrome: {
                args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
            },
            defaultPopupAction: 'accept',
        } );

        await I._init();
        await I._beforeSuite();
    } );

    beforeEach( async () => {
        await I._test( {
            titlePath: () => [ 'New feature' ],
            file: `${process.cwd()}/test/feature.js`,
        } );
        await I._before();
    } );

    afterEach( async () => {
        await I._after();
    } );

    it( 'Should save element ', async () => {
        let payload = null;

        onSaveElement = ( data: any ) => {
            payload = data;
        };

        await I.amOnPage( '/' );
        await I.click( '[href="#info"]' );

        expect( payload ).to.be.not.null;
        expect( payload.locator ).to.be.equals( '[href="#info"]' );
        expect( payload.feature ).to.be.equals( 'New feature' );
        expect( payload.data.tag ).to.be.equals( 'a' );
        expect( payload.data.innerText ).to.be.equals( 'Get more info!' );
    } );

    it( 'Should heal element ', async () => {
        let payload = null;

        onHealElement = ( data: any ) => {
            payload = data;
        };

        await I.amOnPage( '/' );

        try {
            await I.click( '[href="#information"]' );
        } catch ( error ) {
            expect( error.message ).to.be.equals(
                'Clickable element "[href="#information"]" was not found by text|CSS|XPath',
            );
        }

        expect( payload ).to.be.not.null;
        expect( payload.locator ).to.be.equals( '[href="#information"]' );
        expect( payload.feature ).to.be.equals( 'New feature' );
        expect( payload.testPath ).to.be.equals( './test/feature.js' );
        expect( payload.body ).to.match( /<body[\S\s]+?>[\S\s]+<\/body>/ );
    } );
} );
