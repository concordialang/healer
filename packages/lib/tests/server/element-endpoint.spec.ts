import { UIElement } from '@healer/common';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { closeConnection, initDatabase } from '../../src/database/manager';
import { UIElementRepository } from '../../src/database/repositories';
import { OutputLevel, setLevel } from '../../src/output';
import { elementEndpoint } from '../../src/server/enpoints';

use( chaiAsPromised );

describe( 'Element Endpoint', () => {
    before( async () => {
        setLevel( OutputLevel.TEST );
        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );
    } );

    after( async () => {
        await closeConnection();
    } );

    it( 'Should insert a valid new element', async () => {
        const uiElement: UIElement = {
            feature: 'feature',
            locator: '#locator',
            locatorType: 'id',
            content: {
                key: 'value',
            },
            uiType: 'html',
        };

        await elementEndpoint(
            {
                body: uiElement,
            },
            null,
        );

        const expectedLength = 1;
        const saved = await UIElementRepository.find();

        expect( saved ).to.be.not.empty;
        expect( saved ).to.have.length( expectedLength );
    } );

    it( 'Should update existing element', async () => {
        const uiElement: UIElement = {
            feature: 'feature',
            locator: '#locator',
            locatorType: 'id',
            content: {
                key: 'value',
                otherKey: 'otherValue',
            },
            uiType: 'html',
        };

        await elementEndpoint(
            {
                body: uiElement,
            },
            null,
        );

        const expectedLength = 1;
        const saved = await UIElementRepository.find();

        expect( saved ).to.be.not.empty;
        expect( saved ).to.have.length( expectedLength );
    } );

    it( 'Should throw an error on invalid element', () => {
        const uiElement = {
            feature: 'feature',
            locator: '#locator',
        };

        expect(
            elementEndpoint(
                {
                    body: uiElement,
                },
                null,
            ),
        ).to.eventually.be.rejected;
    } );
} );
