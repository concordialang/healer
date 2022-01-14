import { expect } from 'chai';

import { server } from '../../src/command/server';
import { closeConnection } from '../../src/database';
import { OutputLevel, setLevel } from '../../src/output';
import { closeServer } from '../../src/server';

describe( 'Server command', () => {
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
                port: 5000,
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
                port: 5000,
            },
            healer: null,
        } );

        expect( ok ).to.be.false;
    } );
} );
