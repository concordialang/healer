import { expect } from 'chai';
import fs from 'fs';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';
import { before } from 'mocha';

import loadConfig from '../src/load-config';

describe( 'Load config', () => {
    const jsonConfig: any = { server: 'ws://localhost:5000' };

    before( () => {
        patchRequire( vol );
    } );

    after( () => {
        vol.reset();
        patchRequire( fs );
    } );

    it( 'Should throw an error if config file not exists', () => {
        const configFile = '.healerrc.json';

        expect( () => loadConfig( configFile ) ).to.throw(
            `Cannot find configuration file "${configFile}"`,
        );
    } );

    it( 'Should throw an error if server option is not in config file', () => {
        const configFile = '.healerrc.json';

        vol.fromJSON( { [ configFile ]: JSON.stringify( {} ) } );

        expect( () => loadConfig( configFile ) ).to.throw(
            `Server option not provided in configuration file "${configFile}"`,
        );
    } );

    it( 'Should load config from file', () => {
        const configFile = 'healer.json';

        vol.fromJSON( { [ configFile ]: JSON.stringify( jsonConfig ) } );

        const config = loadConfig( configFile );

        expect( config.server ).to.be.equals( 'ws://localhost:5000' );
    } );
} );
