import { expect } from 'chai';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';

import { Requirement } from '../../src/requirement';

const onArray = ( data: any[], entry: any ): any => {
    return data.find( ( value: any ) => value.name === entry.name );
};

describe( 'Requirement', () => {
    const localPackage: string = 'local-package';
    const modulePackage: string = 'module-package';
    const firstExported: string = 'first-data';
    const secondExported: string = 'second-data';
    const packageContent: string = `
        module.exports = [
            { name: '${firstExported}' },
            { name: '${secondExported}' },
        ]
    `;

    before( () => {
        vol.fromJSON( {
            [ `${localPackage}/index.js` ]: packageContent,
            [ `node_modules/${modulePackage}/index.js` ]: packageContent,
        } );
        patchRequire( vol );
    } );

    describe( 'Local requires', () => {
        const localPackageFrom: string = `./${localPackage}`;

        it( 'Should require correct data from package', async () => {
            const requirement = new Requirement( { onArray } );
            const firstData = await requirement.find( {
                name: firstExported,
                from: localPackageFrom,
            } );

            expect( firstData.name ).to.be.equal( firstExported );

            const secondData = await requirement.find( {
                name: secondExported,
                from: localPackageFrom,
            } );

            expect( secondData.name ).to.be.equal( secondExported );
        } );

        it( 'Should cache required data from package', async () => {
            const cache: Record<string, any> = {};
            const requirement = new Requirement( { cache, onArray } );
            const firstData = await requirement.find( {
                name: firstExported,
                from: localPackageFrom,
            } );

            expect( firstData.name ).to.be.equal( firstExported );
            expect( cache ).to.have.property( localPackageFrom );

            const secondData = await requirement.find( {
                name: secondExported,
                from: localPackageFrom,
            } );

            expect( secondData.name ).to.be.equal( secondExported );
        } );

        it( 'Should use cached required data', async () => {
            const otherPackage: string = './other-package';
            const cache: Record<string, any> = { [ otherPackage ]: { name: firstExported } };
            const requirement = new Requirement( { cache, onArray } );
            const data = await requirement.find( {
                name: firstExported,
                from: otherPackage,
            } );

            expect( data.name ).to.be.equal( firstExported );
        } );
    } );

    describe( 'Node Modules requires', () => {
        it( 'Should require correct data from package', async () => {
            const requirement = new Requirement( { onArray } );
            const firstData = await requirement.find( {
                name: firstExported,
                from: modulePackage,
            } );

            expect( firstData.name ).to.be.equal( firstExported );

            const secondData = await requirement.find( {
                name: secondExported,
                from: modulePackage,
            } );

            expect( secondData.name ).to.be.equal( secondExported );
        } );

        it( 'Should cache required data from package', async () => {
            const cache: Record<string, any> = {};
            const requirement = new Requirement( { cache, onArray } );
            const firstData = await requirement.find( {
                name: firstExported,
                from: modulePackage,
            } );

            expect( firstData.name ).to.be.equal( firstExported );
            expect( cache ).to.have.property( modulePackage );

            const secondData = await requirement.find( {
                name: secondExported,
                from: modulePackage,
            } );

            expect( secondData.name ).to.be.equal( secondExported );
        } );

        it( 'Should use cached required data', async () => {
            const otherPackage: string = './other-package';
            const cache: Record<string, any> = { [ otherPackage ]: { name: firstExported } };
            const requirement = new Requirement( { cache, onArray } );
            const data = await requirement.find( {
                name: firstExported,
                from: otherPackage,
            } );

            expect( data.name ).to.be.equal( firstExported );
        } );
    } );

    after( () => {
        vol.reset();
    } );
} );
