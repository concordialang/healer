import { expect } from 'chai';
import { vol } from 'memfs';

import { healFeature } from '../../src/plugin/heal-feature';
import { clearIndentation } from '../utils';

describe( 'Heal feature', () => {
    const loginTestPath = `${__dirname}/tests/login.js`;
    const accountTestPath = `${__dirname}/tests/account.js`;
    const loginTestCasePath = `${__dirname}/features/login.testcase`;
    const accountTestCasePath = `${__dirname}/features/account.testcase`;
    const loginFeaturePath = `${__dirname}/features/login.feature`;
    const accountFeaturePath = `${__dirname}/features/account.feature`;
    const loginTestContent = `
    // Generated with ❤ by Concordia
    // source: ${loginTestCasePath}
    `;
    const accountTestContent = `
    // Generated with ❤ by Concordia
    // source: ${accountTestCasePath}
    `;
    const loginFeatureContent = `
    Feature: Login

    Scenario: Successful login
    Variant: Login with username and password
        Given that I am on the "/page"
        When I enter with "bob" in {Username}
          and I enter with "123456" in {Password}
          and I click on <.submit>
        Then I see "Welcome"
          and I have ~user logged in~

    UI Element: Username
      - selector is "username"

    UI Element: Password
      - selector is '#password'
    `;
    const accountFeatureContent = `
    import "login.feature"

    Feature: My Account
      Scenario: See my account data
        Variant: Show basic data by default
          Given that I have ~user logged in~
            and I am on the "/account"
          Then I see <#name> with "Robert Downey Jr"
    `;

    beforeEach( () => {
        vol.fromJSON( {
            [ loginTestPath ]: loginTestContent,
            [ accountTestPath ]: accountTestContent,
            [ loginFeaturePath ]: loginFeatureContent,
            [ accountFeaturePath ]: accountFeatureContent,
        } );
    } );

    afterEach( () => {
        vol.reset();
    } );

    it( 'Should heal login feature', () => {
        healFeature(
            loginTestPath,
            {
                username: 'user',
                '#password': '#pass',
                '.submit': '#submit',
            },
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
            and I click on <#submit>
          Then I see "Welcome"
            and I have ~user logged in~

        UI Element: Username
          - selector is "user"

        UI Element: Password
          - selector is '#pass'
        ` );

        expect( feature ).to.be.equals( expected );
    } );

    it( 'Should heal account feature and imported login feature', () => {
        healFeature(
            accountTestPath,
            {
                username: 'user',
                '#password': '#pass',
                '.submit': '#submit',
                '#name': '.name',
            },
            vol,
        );
        const loginFeature = clearIndentation(
            vol.readFileSync( loginFeaturePath, { encoding: 'utf-8' } ) as string,
        );
        const accountFeature = clearIndentation(
            vol.readFileSync( accountFeaturePath, { encoding: 'utf-8' } ) as string,
        );
        const expectedLoginFeature = clearIndentation( `
        Feature: Login

        Scenario: Successful login
        Variant: Login with username and password
          Given that I am on the "/page"
          When I enter with "bob" in {Username}
            and I enter with "123456" in {Password}
            and I click on <#submit>
          Then I see "Welcome"
            and I have ~user logged in~

        UI Element: Username
          - selector is "user"

        UI Element: Password
          - selector is '#pass'
        ` );
        const expectedAccountFeature = clearIndentation( `
        import "login.feature"

        Feature: My Account
        Scenario: See my account data
          Variant: Show basic data by default
          Given that I have ~user logged in~
            and I am on the "/account"
          Then I see <.name> with "Robert Downey Jr"
        ` );

        expect( loginFeature ).to.be.equals( expectedLoginFeature );
        expect( accountFeature ).to.be.equals( expectedAccountFeature );
    } );
} );
