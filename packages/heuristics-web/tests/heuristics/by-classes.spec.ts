import { HeuristicResult } from '@concordialang-healer/common';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import byClassesHeuristic from '../../src/heuristics/by-classes';

describe( 'By Classes Heuristic', () => {
    const byClasses = byClassesHeuristic();

    it( 'Should return empty', () => {
        const source = new JSDOM( `
        <form>
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                attributes: {
                    class: 'input',
                },
            },
        };
        const healingElements = byClasses.run( { element, source } );

        expect( healingElements ).to.be.empty;
    } );

    it( 'Should find one element with score 1 and weight 1', () => {
        const source = new JSDOM( `
        <form>
            <input type="text" id="username" name="username" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                attributes: {
                    class: 'input',
                },
            },
        };
        const healingElements = byClasses.run( { element, source } ) as HeuristicResult[];

        expect( healingElements ).to.have.length( 1 );
        expect( healingElements[ 0 ].weight ).to.be.equals( 1 );
        expect( healingElements[ 0 ].elements ).to.have.length( 1 );

        const [ healingElement ] = healingElements[ 0 ].elements;

        expect( healingElement.score ).to.be.equals( 1 );
        expect( healingElement.locator ).to.be.equals( '.input' );
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
                attributes: {
                    class: 'input',
                },
            },
        };

        const healingElements = byClasses.run( { element, source: page } ) as HeuristicResult[];

        expect( healingElements ).to.have.length( 1 );
        expect( healingElements[ 0 ].weight ).to.be.equals( 0.5 );
        expect( healingElements[ 0 ].elements ).to.have.length( 2 );

        healingElements[ 0 ].elements.forEach( ( healingElement ) => {
            expect( healingElement.score ).to.be.equals( 1 );
            expect( healingElement.locator ).to.be.equals( '.input' );
        } );
    } );

    it( 'Should find two elements with weight 0.5 and one element weight 1', () => {
        const page = new JSDOM( `
            <form>
                <input type="text" id="user" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button class="btn" type="submit">Submit</button>
            </form>
        ` ).window.document;
        const element: any = {
            content: {
                attributes: {
                    class: 'input btn',
                },
            },
        };

        const healingElements = byClasses.run( { element, source: page } ) as HeuristicResult[];

        expect( healingElements ).to.have.length( 2 );
        expect( healingElements[ 0 ].weight ).to.be.equals( 0.5 );
        expect( healingElements[ 0 ].elements ).to.have.length( 2 );
        expect( healingElements[ 1 ].weight ).to.be.equals( 1 );
        expect( healingElements[ 1 ].elements ).to.have.length( 1 );

        expect( healingElements[ 0 ].elements[ 0 ].score ).to.be.equals( 1 );
        expect( healingElements[ 0 ].elements[ 0 ].locator ).to.be.equals( '.input' );

        expect( healingElements[ 0 ].elements[ 1 ].score ).to.be.equals( 1 );
        expect( healingElements[ 0 ].elements[ 1 ].locator ).to.be.equals( '.input' );

        expect( healingElements[ 1 ].elements[ 0 ].score ).to.be.equals( 1 );
        expect( healingElements[ 1 ].elements[ 0 ].locator ).to.be.equals( '.btn' );
    } );
} );
