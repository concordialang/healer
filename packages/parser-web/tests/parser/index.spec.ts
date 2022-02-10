import { expect } from 'chai';

import Parser from '../../src/parser';

describe( 'Parser', () => {
    const source = `
    <html>
        <body>
            <form>
                <input type="text" id="username" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button type="submit" class="btn">Sign In</button>
            </form>
        </body>
    </html>
    `;

    it( 'Should transform a string page into document', () => {
        const parser = Parser();
        const { source: document } = parser.transform( { source, element: null } );

        expect( document ).to.be.not.null;
        expect( document.querySelector( '#username' ) ).to.be.not.null;
        expect( document.querySelector( '#password' ) ).to.be.not.null;
        expect( document.querySelector( '[type="submit"]' ) ).to.be.not.null;
    } );

    it( 'Should generate a locator from node element', () => {
        const parser = Parser( {
            locator: {
                exclude: [ 'btn' ],
            },
        } );
        const { source: document } = parser.transform( { source, element: null } );

        const inputUsername = document.querySelector( '[name="username"]' );
        const inputPassword = document.querySelector( '[name="password"]' );
        const buttonSubmit = document.querySelector( 'button' );

        expect(
            parser.toLocator( {
                element: null,
                healing: {
                    totalScore: 1,
                    node: inputUsername,
                    appliedHeuristics: [],
                },
            } ),
        ).to.be.equals( '#username' );
        expect(
            parser.toLocator( {
                element: null,
                healing: {
                    totalScore: 1,
                    node: inputPassword,
                    appliedHeuristics: [],
                },
            } ),
        ).to.be.equals( '#password' );
        expect(
            parser.toLocator( {
                element: null,
                healing: {
                    totalScore: 1,
                    node: buttonSubmit,
                    appliedHeuristics: [],
                },
            } ),
        ).to.be.equals( '[type="submit"]' );
    } );
} );
