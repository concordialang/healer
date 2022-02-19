import { HeuristicResult } from '@concordialang-healer/common';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';

import byTextHeuristic from '../../src/heuristics/by-text';

describe( 'By Text Heuristic', () => {
    const byText = byTextHeuristic();

    it( 'Should return empty', () => {
        const source = new JSDOM( `
        <form>
            <input type="text" id="username" name="username" class="input">
            <button class="btn" type="submit">Submit</button>
        </form>
        ` ).window.document;
        const element: any = {
            content: {
                tag: 'button',
                textContent: 'Test',
            },
        };
        const healingElements = byText.run( { element, source } );

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
                tag: 'button',
                textContent: 'Submit',
            },
        };
        const healingElements = byText.run( { element, source } ) as HeuristicResult;

        expect( healingElements.elements ).to.have.length( 1 );
        expect( healingElements.weight ).to.be.equals( 1 );
        expect( healingElements.elements[ 0 ].score ).to.be.equals( 1 );
    } );

    it( 'Should find one elements with score 1', () => {
        const page = new JSDOM( `
            <form>
                <input type="text" id="user" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button class="btn" type="submit">Submit</button>
                <div class="help">Submit</div>
            </form>
        ` ).window.document;
        const element: any = {
            content: {
                tag: 'button',
                textContent: 'Submit',
            },
        };

        const healingElements = byText.run( { element, source: page } ) as HeuristicResult;

        expect( healingElements.elements ).to.have.length( 1 );
        expect( healingElements.weight ).to.be.equals( 1 );
        expect( healingElements.elements[ 0 ].score ).to.be.equals( 1 );
    } );
} );
