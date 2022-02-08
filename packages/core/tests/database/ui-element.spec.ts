import { expect } from 'chai';

import { closeConnection, initDatabase } from '../../src/database';
import { UIElement } from '../../src/database/entities';
import { UIElementRepository } from '../../src/database/repositories';

describe( 'UI Element', () => {
    before( async () => {
        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );
    } );

    after( async () => {
        await closeConnection();
    } );

    const uiElements = [
        new UIElement( {
            feature: 'feature',
            locator: 'locator',
            locatorType: 'locatorType',
            uiType: 'uiType',
            content: { key: 'value' },
        } ),
        new UIElement( {
            feature: 'feature1',
            locator: 'locator1',
            locatorType: 'locatorType1',
            uiType: 'uiType1',
            content: { key1: 'value1' },
        } ),
        new UIElement( {
            feature: 'feature2',
            locator: 'locator2',
            locatorType: 'locatorType2',
            uiType: 'uiType2',
            content: { key2: 'value2' },
        } ),
    ];

    it( 'Should generate uuid', () => {
        const uuidLength = 36;
        const [ element ] = uiElements;

        expect( element.uuid ).to.has.length( uuidLength );
    } );

    it( 'Should save new ui elements', async () => {
        await UIElementRepository.upsert( uiElements );

        const saved = await UIElementRepository.find();
        const expectedLength = 3;

        expect( saved ).to.be.not.empty;
        expect( saved ).to.have.length( expectedLength );
    } );

    it( 'Should update when ui elements already exists', async () => {
        const content = {
            key: 'value',
            key1: 'value1',
        };
        const expectedLength = 3;
        const [ element ] = uiElements;

        element.content = content;

        await UIElementRepository.upsert( uiElements );

        const persisted = await UIElementRepository.find();

        expect( persisted ).to.be.not.null;
        expect( persisted ).to.have.length( expectedLength );

        const [ firstElement ] = persisted;

        expect( firstElement.content ).to.be.deep.equals( content );
    } );

    it( 'Should update ui element', async () => {
        const [ element ] = uiElements;
        const newLocator = 'new-locator';
        const elementToUpdate = new UIElement( {
            ...element,
            uuid: undefined,
            locator: newLocator,
        } );

        await UIElementRepository.update( element.uuid, elementToUpdate );

        const persisted = await UIElementRepository.find();

        expect( persisted ).to.be.not.empty;

        const [ firstElement ] = persisted;

        expect( firstElement.locator ).to.be.equals( newLocator );
        expect( firstElement.uuid ).to.be.equals( elementToUpdate.uuid );
    } );

    it( 'Should find ui elements', async () => {
        const expectedTotalLength = 3;
        let elements = await UIElementRepository.find();

        expect( elements ).to.be.not.empty;
        expect( elements ).to.have.length( expectedTotalLength );

        const expectedPartialLength = 2;
        const sliceStart = 1;
        const sliceEnd = 3;
        const uuids = uiElements.slice( sliceStart, sliceEnd )
            .map( ( value ) => value.uuid );

        elements = await UIElementRepository.find( {
            uuid: { $in: uuids },
        } );

        expect( elements ).to.have.length( expectedPartialLength );

        elements = await UIElementRepository.find( { uuid: 'uuid' } );

        expect( elements ).to.be.empty;
    } );

    it( 'Should find one ui element', async () => {
        const [ , secondElement ] = uiElements;
        let element = await UIElementRepository.findOne( {
            uuid: secondElement.uuid,
        } );

        expect( element ).to.have.be.deep.equals( secondElement );

        element = await UIElementRepository.findOne( { uuid: 'uuid' } );

        expect( element ).to.be.null;
    } );
} );
