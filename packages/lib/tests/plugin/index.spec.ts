import { expect } from 'chai';
import { vol } from 'memfs';

import { closeConnection, initDatabase } from '../../src/database';
import { HealingResult, UIElement } from '../../src/database/entities';
import { HealingResultRepository, UIElementRepository } from '../../src/database/repositories';
import { HealingResultStatus } from '../../src/models';
import { OutputLevel, setLevel } from '../../src/output';
import { afterReporting, findSuccessHealingResult } from '../../src/plugin';
import { clearIndentation } from '../utils';

describe( 'Plugin', () => {
    const loginTestPath = `${__dirname}/tests/login.js`;
    const loginFeaturePath = `${__dirname}/features/login.feature`;
    const loginTestCasePath = `${__dirname}/features/login.testcase`;
    const accountTestPath = `${__dirname}/tests/account.js`;
    const loginTestContent = `
    // Generated with ❤ by Concordia
    // source: ${loginTestCasePath}
    `;
    const loginFeatureContent = `
    Feature: Login

    Scenario: Successful login
    Variant: Login with username and password
        Given that I am on the "/page"
        When I enter with "bob" in {Username}
          and I enter with "123456" in {Password}
          and I click on {Ok}
        Then I see "Welcome"
          and I have ~user logged in~

    UI Element: Username
      - selector is "#username"

    UI Element: Password
      - selector is "#password"

    UI Element: Ok
      - selector is "[type=submit]"
    `;

    before( async () => {
        setLevel( OutputLevel.TEST );

        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );

        const passwordElement = new UIElement( {
            feature: 'Login',
            locator: '#password',
            locatorType: 'css',
            uiType: 'html',
            content: { tag: 'input' },
        } );
        const nameElement = new UIElement( {
            feature: 'My Account',
            locator: '#name',
            locatorType: 'css',
            uiType: 'html',
            content: { tag: 'input' },
        } );

        await UIElementRepository.upsert( passwordElement );
        await UIElementRepository.upsert( nameElement );
        await HealingResultRepository.save(
            new HealingResult( {
                newLocator: '.pass',
                element: passwordElement,
                score: 0.9,
                status: HealingResultStatus.SUCCESS,
                testPath: loginTestPath,
            } ),
        );
        await HealingResultRepository.save(
            new HealingResult( {
                newLocator: '.name',
                element: nameElement,
                score: 0.9,
                status: HealingResultStatus.SUCCESS,
                testPath: accountTestPath,
            } ),
        );
        await HealingResultRepository.save(
            new HealingResult( {
                element: passwordElement,
                status: HealingResultStatus.FAIL,
                testPath: loginTestPath,
            } ),
        );

        vol.fromJSON( {
            [ loginTestPath ]: loginTestContent,
            [ loginFeaturePath ]: loginFeatureContent,
        } );
    } );

    after( async () => {
        await closeConnection();
    } );

    it( 'Should get all not showed success healing results', async () => {
        const results = await findSuccessHealingResult();

        expect( results ).to.have.length( 2 );
        expect( results[ 0 ].newLocator ).to.be.equals( '.name' );
        expect( results[ 0 ].element.locator ).to.be.equals( '#name' );
        expect( results[ 1 ].newLocator ).to.be.equals( '.pass' );
        expect( results[ 1 ].element.locator ).to.be.equals( '#password' );
    } );

    it( 'Should adjust the feature', async () => {
        await afterReporting(
            ( results ) => {
                return Promise.resolve( [ results.slice( 1 ), results.slice( 0, 1 ) ] );
            },
            () => Promise.resolve( true ),
            vol,
        );

        const feature = clearIndentation(
            vol.readFileSync( loginFeaturePath, { encoding: 'utf-8' } ) as string,
        );
        const expected = clearIndentation( `
        Feature: Login

        Scenario: Successful login
        Variant: Login with username and password
          Given that I am on the "/page"
          When I enter with "bob" in {Username}
            and I enter with "123456" in {Password}
            and I click on {Ok}
          Then I see "Welcome"
            and I have ~user logged in~

        UI Element: Username
          - selector is "#username"

        UI Element: Password
          - selector is ".pass"

        UI Element: Ok
          - selector is "[type=submit]"
        ` );

        expect( feature ).to.be.equals( expected );
    } );
} );
