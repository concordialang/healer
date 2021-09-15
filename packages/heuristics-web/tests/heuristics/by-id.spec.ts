import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import byIdHeuristic from '../../src/heuristics/by-id';

describe( 'By Id Heuristic', () => {
    const byId = byIdHeuristic();

    const source = new JSDOM( `
    <form>
        <input type="text" id="username" name="username" class="input">
        <input type="text" id="password" name="password" class="input">
        <button type="submit">Sign In</button>
    </form>
    ` ).window.document;

    it( 'Should return empty if element has no id', () => {
        const element: any = {
            content: {
                tag: 'input',
            },
        };
        const healingElements = byId.run( { element, source } );

        expect( healingElements ).to.be.empty;
    } );

    it( 'Should find one element with total score', () => {
        const element: any = {
            content: {
                attributes: {
                    id: 'username',
                },
            },
        };
        const healingElements = byId.run( { element, source } );

        expect( healingElements ).to.have.length( 1 );

        const [ healingElement ] = healingElements;

        expect( healingElement.score ).to.be.equals( 1 );
        expect( healingElement.weight ).to.be.equals( 1 );
        expect( healingElement.locator ).to.be.equals( '#username' );
    } );

    it( 'Should find two elements with half of total score', () => {
        const page = new JSDOM( `
        <form id="user">
            <input type="text" id="user" name="username" class="input">
            <input type="text" id="password" name="password" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                attributes: {
                    id: 'user',
                },
            },
        };

        const healingElements = byId.run( { element, source: page } );

        expect( healingElements ).to.have.length( 2 );

        healingElements.forEach( ( healingElement ) => {
            expect( healingElement.score ).to.be.equals( 1 );
            expect( healingElement.weight ).to.be.equals( 0.5 );
            expect( healingElement.locator ).to.be.equals( '#user' );
        } );
    } );
} );
