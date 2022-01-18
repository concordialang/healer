import { expect } from 'chai';

import Healer from '../../../heuristics-web/src/healer';
import Heuristics from '../../../heuristics-web/src/heuristics';
import { closeConnection, initDatabase } from '../../src/database';
import { UIElement } from '../../src/database/entities';
import { UIElementRepository } from '../../src/database/repositories';
import { healProcess } from '../../src/heal/heal-process';
import { OutputLevel, setLevel } from '../../src/output';
import { getUIElement } from '../../src/utils';

describe( 'Heal Process', () => {
    const healer = Healer();
    const heuristics = Heuristics.map( ( Heuristic ) => Heuristic() );

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

    it( 'Should return a new locator for username with score 1', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" id="password" name="password" class="input">
            <input class="btn" type="submit" value="Submit">
        </form>
        `;
        const element = await getUIElement( {
            feature: '/login',
            locator: '#username',
        } );

        const scoredLocators = healProcess( {
            element,
            source,
            options: {
                heuristics,
                healer,
            },
        } );

        expect( scoredLocators.locator ).to.be.equals( '[name="username"]' );
        expect( scoredLocators.score ).to.be.equals( 1 );
    } );

    it( 'Should return a new locator for password with score 1', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" name="pass" class="input">
            <input class="btn" type="submit" value="Submit">
        </form>
        `;
        const element = await getUIElement( {
            feature: '/login',
            locator: '#password',
        } );
        const scoredLocators = healProcess( {
            element,
            source,
            options: {
                heuristics,
                healer,
            },
        } );

        expect( scoredLocators.locator ).to.be.equals( '[name="pass"]' );
        expect( scoredLocators.score ).to.be.equals( 1 );
    } );

    it( 'Should return a new locator for submit with score 0.8', async () => {
        const source = `
        <form>
            <input type="text" name="username" class="input">
            <input type="text" id="password" name="password" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        `;
        const element = await getUIElement( {
            feature: '/login',
            locator: '[type="submit"]',
        } );
        const scoredLocators = healProcess( {
            element,
            source,
            options: {
                heuristics,
                healer,
            },
        } );

        expect( scoredLocators.locator ).to.be.equals( '.btn' );
        expect( scoredLocators.score ).to.be.equals( 0.8 );
    } );
} );
