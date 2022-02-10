import { expect } from 'chai';

import { closeConnection, initDatabase } from '../../src/database';
import { HealingResult, UIElement } from '../../src/database/entities';
import { HealingResultRepository } from '../../src/database/repositories';
import { HealingResultStatus } from '../../src/models';

describe( 'Healing Result', () => {
    before( async () => {
        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );
    } );

    after( async () => {
        await closeConnection();
    } );

    const healingResult = new HealingResult( {
        newLocator: 'new-locator',
        element: new UIElement( {
            feature: 'feature',
            locator: 'locator',
            locatorType: 'locatorType',
            uiType: 'uiType',
            content: { key: 'value' },
        } ),
        score: 0.9,
        status: HealingResultStatus.SUCCESS,
        testPath: '/test/path',
    } );

    it( 'Should generate uuid', () => {
        const uuidLength = 36;

        expect( healingResult.uuid ).to.has.length( uuidLength );
    } );

    it( 'Should save new healing result', async () => {
        await HealingResultRepository.save( healingResult );

        const saved = await HealingResultRepository.find();
        const expectedLength = 1;

        expect( saved ).to.be.not.empty;
        expect( saved ).to.have.length( expectedLength );

        const [ result ] = saved;

        expect( result.uuid ).to.be.equals( healingResult.uuid );
    } );

    it( 'Should update healing result status', async () => {
        healingResult.status = HealingResultStatus.SUCCESS_NOT_ACCEPTED;

        await HealingResultRepository.update( healingResult );

        let result = await HealingResultRepository.findOne( {
            uuid: healingResult.uuid,
        } );

        expect( result.status ).to.be.equals( healingResult.status );

        healingResult.status = HealingResultStatus.SUCCESS_ACCEPTED;

        await HealingResultRepository.update( healingResult );

        result = await HealingResultRepository.findOne( {
            uuid: healingResult.uuid,
        } );

        expect( result.status ).to.be.equals( healingResult.status );
    } );

    it( 'Should find healing results', async () => {
        const expectedLength = 1;
        let elements = await HealingResultRepository.find();

        expect( elements ).to.be.not.empty;
        expect( elements ).to.have.length( expectedLength );

        elements = await HealingResultRepository.find( {
            uuid: { $in: [ healingResult.uuid ] },
        } );

        expect( elements ).to.have.length( expectedLength );

        elements = await HealingResultRepository.find( { uuid: 'uuid' } );

        expect( elements ).to.be.empty;
    } );

    it( 'Should find one healing result', async () => {
        let element = await HealingResultRepository.findOne( {
            uuid: healingResult.uuid,
        } );

        expect( element.uuid ).to.be.not.null;
        expect( element.uuid ).to.be.equals( healingResult.uuid );

        element = await HealingResultRepository.findOne( { uuid: 'uuid' } );

        expect( element ).to.be.null;
    } );
} );
