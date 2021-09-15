import { expect } from 'chai';

import healer from '../../src/healer';

describe( 'Healer', () => {
    const source = `
    <html>
        <body>
            <form>
                <input type="text" id="username" name="username" class="input">
                <input type="text" id="password" name="password" class="input">
                <button type="submit">Sign In</button>
            </form>
        </body>
    </html>
    `;

    it( 'Should transform a string page into document', () => {
        const { source: document } = healer.transform( { source, element: null } );

        expect( document ).to.be.not.null;
        expect( document.querySelector( '#username' ) ).to.be.not.null;
        expect( document.querySelector( '#password' ) ).to.be.not.null;
        expect( document.querySelector( '[type="submit"]' ) ).to.be.not.null;
    } );

    it( 'Should generate a locator from node element', () => {
        const { source: document } = healer.transform( { source, element: null } );

        const inputUsername = document.querySelector( '[name="username"]' );
        const inputPassword = document.querySelector( '[name="password"]' );
        const buttonSubmit = document.querySelector( 'button' );

        expect(
            healer.toLocator( {
                element: null,
                node: inputUsername,
            } ),
        ).to.be.equals( '#username' );
        expect(
            healer.toLocator( {
                element: null,
                node: inputPassword,
            } ),
        ).to.be.equals( '#password' );
        expect(
            healer.toLocator( {
                element: null,
                node: buttonSubmit,
            } ),
        ).to.be.equals( '[type="submit"]' );
    } );
} );
