import { expect } from 'chai';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';
import { join } from 'path';

import { init } from '../../src/command/init';
import { DEFAULT_CONFIG_FILE_NAME } from '../../src/constants';
import { HealerConfig } from '../../src/models';
import { OutputLevel, setLevel } from '../../src/output';

describe( 'Init command', () => {
    const configContent: HealerConfig = { heuristics: [] };
    const path: string = process.cwd();

    setLevel( OutputLevel.TEST );

    beforeEach( () => {
        vol.mkdirSync( path, { recursive: true } );
        patchRequire( vol );
    } );

    afterEach( () => {
        vol.reset();
    } );

    it( 'Should create config file if not exists', () => {
        const expectedConfigPath: string = join( path, DEFAULT_CONFIG_FILE_NAME );
        const configPath: string = init( { path, fileSystem: vol } );

        expect( configPath ).to.be.equals( expectedConfigPath );
        expect( vol.existsSync( configPath ) ).to.be.true;
    } );

    it( 'Should not create file if already exists', () => {
        const expectedConfigPath: string = join( path, DEFAULT_CONFIG_FILE_NAME );

        vol.fromJSON( { [ DEFAULT_CONFIG_FILE_NAME ]: JSON.stringify( configContent ) } );

        const configPath: string = init( { path, fileSystem: vol } );

        expect( configPath ).to.be.null;
        expect( vol.existsSync( expectedConfigPath ) ).to.be.true;
    } );
} );
