import { expect } from 'chai';

import { server } from '../../src/command/server';
import { closeConnection } from '../../src/database';
import { OutputLevel, setLevel } from '../../src/output';
import { closeServer } from '../../src/server';

describe( 'Server command', () => {
    const testPort = 5000;

    before( () => {
        setLevel( OutputLevel.TEST );
    } );

    after( async () => {
        closeServer();
        await closeConnection();
    } );

    it( 'Should correct init database and server', async () => {
        const ok = await server( {
            database: {
                type: 'sqlite',
                dbName: ':memory:',
            },
            server: {
                port: testPort,
            },
            healer: null,
        } );

        expect( ok ).to.be.true;
    } );

    it( 'Should not init on database connection error', async () => {
        const ok = await server( {
            database: {
                type: 'postgresql',
                dbName: ':memory:',
            },
            server: {
                port: testPort,
            },
            healer: null,
        } );

        expect( ok ).to.be.a;
    } );
} );
