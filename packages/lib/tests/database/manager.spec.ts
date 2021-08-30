import '@mikro-orm/sqlite';

import { assert, expect } from 'chai';

import { closeConnection, getManager, initDatabase } from '../../src/database';

describe( 'Database Manager', () => {
    it( 'Should init database', async () => {
        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );
    } );

    it( 'Should has manager', () => {
        expect( getManager() ).to.be.not.null;
    } );

    it( 'Should close connection', async () => {
        await closeConnection();

        assert.ok( true );
    } );
} );
