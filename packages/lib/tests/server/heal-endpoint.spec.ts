import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import Healer from '../../../heuristics-web/src/healer';
import Heuristics from '../../../heuristics-web/src/heuristics';
import { UIElement } from '../../src/database/entities';
import { closeConnection, initDatabase } from '../../src/database/manager';
import { UIElementRepository } from '../../src/database/repositories';
import { OutputLevel, setLevel } from '../../src/output';
import { healEndpoint } from '../../src/server/enpoints';

use( chaiAsPromised );

describe( 'Heal Endpoint', () => {
    const endpoint = healEndpoint( {
        healer: Healer(),
        heuristics: Heuristics.map( ( Heuristic ) => Heuristic() ),
    } );

    before( async () => {
        setLevel( OutputLevel.TEST );
        await initDatabase( {
            type: 'sqlite',
            dbName: ':memory:',
        } );

        await UIElementRepository.upsert( [
            new UIElement( {
                feature: '/login',
                locator: '#username',
                locatorType: 'id',
                content: {
                    tag: 'input',
                    innerText: null,
                    xpath: '//html/body/form/input[1]',
                    attributes: {
                        id: 'user',
                        name: 'username',
                        class: 'input',
                        type: 'text',
                    },
                },
                scenario: 'login',
                uiType: 'html',
            } ),
            new UIElement( {
                feature: '/login',
                locator: '#password',
                locatorType: 'id',
                content: {
                    tag: 'input',
                    innerText: null,
                    xpath: '//html/body/form/input[2]',
                    attributes: {
                        id: 'password',
                        name: 'password',
                        class: 'input',
                        type: 'text',
                    },
                },
                scenario: 'login',
                uiType: 'html',
            } ),
            new UIElement( {
                feature: '/login',
                locator: '[type="submit"]',
                locatorType: 'attribute',
                content: {
                    tag: 'input',
                    innerText: null,
                    xpath: '//html/body/form/input[3]',
                    attributes: {
                        class: 'btn',
                        type: 'submit',
                    },
                },
                scenario: 'login',
                uiType: 'html',
            } ),
        ] );
    } );

    after( async () => {
        await closeConnection();
    } );

    it( 'Should return a new locator for username', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" id="password" name="password" class="input">
            <input class="btn" type="submit" value="Submit">
        </form>
        `;
        const locators = await new Promise( ( resolve ) => {
            const request = {
                body: {
                    feature: '/login',
                    locator: '#username',
                    source,
                },
            };
            const response = {
                send: ( result: string[] ) => resolve( result ),
            };

            endpoint( request, response );
        } );

        expect( locators ).to.be.deep.equals( [ '[name="username"]' ] );
    } );

    it( 'Should return a new locator for password', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" name="pass" class="input">
            <input class="btn" type="submit" value="Submit">
        </form>
        `;
        const locators = await new Promise( ( resolve ) => {
            const request = {
                body: {
                    feature: '/login',
                    locator: '#password',
                    source,
                },
            };
            const response = {
                send: ( data: string[] ) => resolve( data ),
            };

            endpoint( request, response );
        } );

        expect( locators ).to.be.deep.equals( [ '[name="pass"]', '[name="username"]' ] );
    } );

    it( 'Should return a new locator for submit with score 0.8', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" id="password" name="password" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        `;
        const locators = await new Promise( ( resolve ) => {
            const request = {
                body: {
                    feature: '/login',
                    locator: '[type="submit"]',
                    source,
                },
            };
            const response = {
                send: ( data: string[] ) => resolve( data ),
            };

            endpoint( request, response );
        } );

        expect( locators ).to.be.deep.equals( [ '.btn' ] );
    } );
} );