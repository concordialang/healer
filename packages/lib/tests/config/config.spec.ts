import { expect } from 'chai';
import fs from 'fs';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';

import { Config, ConfigException, defaultLoaders, LoaderFn } from '../../src/config';

describe( 'Config', () => {
    const jsonConfig: any = { property: [ { name: 'first-data' }, { name: 'second-data' } ] };
    const jsConfig: string = `
        module.exports = {
            property: [
                { name: 'first-data' },
                { name: 'second-data' }
            ]
        }
    `;
    const tsConfig: string = `
        export default = {
            "property": [
                { "name": "first-data" },
                { "name": "second-data" }
            ]
        }
    `;
    const jsonFiles: string[] = [ '.testrc.json', 'test.json' ];
    const jsFiles: string[] = [ '.testrc.js', 'test.js' ];
    const tsFiles: string[] = [ '.testrc.ts', 'test.ts' ];
    const fakeTsLoad: LoaderFn = ( filePath: string ) => {
        const content: string = vol.readFileSync( filePath, { encoding: 'utf-8' } ) as string;
        const [ json ] = content.match( / {.+}/s );

        return JSON.parse( json );
    };
    const explorer = new Config( {
        fileNames: jsonFiles.concat( jsFiles, tsFiles ),
        fileSystem: vol,
        loaders: {
            ...defaultLoaders,
            '.ts': fakeTsLoad,
        },
    } );

    before( () => {
        patchRequire( vol );
    } );

    afterEach( () => {
        vol.reset();
    } );

    after( () => {
        patchRequire( fs );
    } );

    describe( 'JSON File', () => {
        for ( const jsonFile of jsonFiles ) {
            it( `Should load config from "${jsonFile}"`, async () => {
                vol.fromJSON( { [ jsonFile ]: JSON.stringify( jsonConfig ) } );

                const config = await explorer.load();

                expect( config ).to.be.not.null;
                expect( config ).to.has.property( 'property' );
            } );
        }
    } );

    describe( 'JS File', () => {
        for ( const jsFile of jsFiles ) {
            it( `Should load config from "${jsFile}"`, async () => {
                vol.fromJSON( { [ jsFile ]: jsConfig } );

                const config: any = await explorer.load();

                expect( config ).to.be.not.null;
                expect( config ).to.has.property( 'property' );
            } );
        }
    } );

    describe( 'TS File', () => {
        for ( const tsFile of tsFiles ) {
            it( `Should load config from "${tsFile}"`, async () => {
                vol.fromJSON( { [ tsFile ]: tsConfig } );

                const config: any = await explorer.load();

                expect( config ).to.be.not.null;
                expect( config ).to.has.property( 'property' );
            } );
        }
    } );

    describe( 'Config Errors', () => {
        it( 'Should throw an error if not find config file', () => {
            expect( () => explorer.load() ).to.throw( ConfigException );
        } );

        it( 'Should throw an error if a loader for an extension was not provided', () => {
            const file: string = '.test';
            const specificExplorer = new Config( {
                fileNames: [ file ],
                fileSystem: vol,
            } );

            vol.fromJSON( { [ file ]: JSON.stringify( jsonConfig ) } );

            expect( () => specificExplorer.load() ).to.throw( ConfigException );
        } );
    } );
} );
