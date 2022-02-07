import { HeuristicResult } from '@concordialang-healer/common';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import byXPathHeuristic from '../../src/heuristics/by-xpath';

describe( 'By XPath Heuristic', () => {
    const byXPath = byXPathHeuristic();

    it( 'Should return empty', () => {
        const source = new JSDOM( `
        <form>
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                xpath: '//html/body/form/input[1]',
            },
        };
        const healingElements = byXPath.run( { element, source } );

        expect( healingElements ).to.be.empty;
    } );

    it( 'Should find one element with score 1 and weight 1', () => {
        const page = new JSDOM( `
            <form>
                <input type="text" id="user" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button class="btn" type="submit">Submit</button>
            </form>
        ` ).window.document;
        const element: any = {
            content: {
                xpath: '//html/body/form/input[1]',
            },
        };

        const healingElements = byXPath.run( { element, source: page } ) as HeuristicResult;

        expect( healingElements.elements ).to.have.length( 1 );
        expect( healingElements.weight ).to.be.equals( 1 );

        const [ healingElement ] = healingElements.elements;

        expect( healingElement.score ).to.be.equals( 1 );
        expect( healingElement.locator ).to.be.equals( '//html/body/form/input[1]' );
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
                xpath: '//html/body/form/input',
            },
        };

        const healingElements = byXPath.run( { element, source: page } ) as HeuristicResult;

        expect( healingElements.elements ).to.have.length( 2 );
        expect( healingElements.weight ).to.be.equals( 0.5 );

        healingElements.elements.forEach( ( healingElement ) => {
            expect( healingElement.score ).to.be.equals( 1 );
            expect( healingElement.locator ).to.be.equals( '//html/body/form/input' );
        } );
    } );
} );
