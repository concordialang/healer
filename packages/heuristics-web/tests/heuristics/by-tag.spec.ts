import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import byTagHeuristic from '../../src/heuristics/by-tag';

describe( 'By Tag Heuristic', () => {
    const byTag = byTagHeuristic();

    it( 'Should find one element with score 1 and weight 1', () => {
        const source = new JSDOM( `
        <form>
            <input type="text" id="username" name="username" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                tag: 'input',
            },
        };
        const healingElements = byTag.run( { element, source } );

        expect( healingElements ).to.have.length( 1 );

        const [ healingElement ] = healingElements;

        expect( healingElement.score ).to.be.equals( 1 );
        expect( healingElement.weight ).to.be.equals( 1 );
        expect( healingElement.locator ).to.be.equals( 'input' );
    } );

    it( 'Should find two elements with score 1 and weight 0.5', () => {
        const page = new JSDOM( `
            <form>
                <input type="text" id="user" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button class="btn" type="submit">Submit</button>
            </form>
        ` ).window.document;
        const element: any = {
            content: {
                tag: 'input',
            },
        };

        const healingElements = byTag.run( { element, source: page } );

        expect( healingElements ).to.have.length( 2 );

        healingElements.forEach( ( healingElement ) => {
            expect( healingElement.score ).to.be.equals( 1 );
            expect( healingElement.weight ).to.be.equals( 0.5 );
            expect( healingElement.locator ).to.be.equals( 'input' );
        } );
    } );
} );
