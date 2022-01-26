import { expect } from 'chai';
import { vol } from 'memfs';
import { join } from 'path';

import { init } from '../../src/command/init';
import { DEFAULT_CONFIG_FILE_NAME } from '../../src/constants';
import { HealerConfig } from '../../src/models';
import { OutputLevel, setLevel } from '../../src/output';

describe( 'Init command', () => {
    const configContent: HealerConfig = {
        heuristics: [],
        healer: null,
        plugin: null,
        database: {
            type: 'sqlite',
            dbName: ':memory:',
        },
        server: {
            port: 5000,
        },
    };

    const path = __dirname;

    before( () => {
        setLevel( OutputLevel.TEST );
    } );

    beforeEach( () => {
        vol.mkdirSync( path, { recursive: true } );
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

        vol.fromJSON( { [ DEFAULT_CONFIG_FILE_NAME ]: JSON.stringify( configContent ) }, path );

        const configPath: string = init( { path, fileSystem: vol } );

        expect( configPath ).to.be.null;
        expect( vol.existsSync( expectedConfigPath ) ).to.be.true;
    } );
} );
