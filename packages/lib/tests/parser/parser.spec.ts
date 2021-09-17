import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';

import { Config, ConfigException } from '../../src/config';
import { CONFIG_FILE_NAMES } from '../../src/constants';
import { HealerConfig } from '../../src/models';
import { getOptions } from '../../src/parser';

use( chaiAsPromised );

describe( 'Parser', () => {
    const firstHeuristic: string = 'first-heuristic';
    const secondHeuristic: string = 'second-heuristic';

    const heuristicsPackage: string = 'heuristics';
    const heuristicsPackageContent: string = `
    module.exports = [
        () => ( { name: '${firstHeuristic}', run: () => '${firstHeuristic}' } ),
        () => ( { name: '${secondHeuristic}', run: () => '${secondHeuristic}' } ),
    ]
    `;
    const healerPackage: string = 'healer';
    const healerPackageContent: string = `
    module.exports = () => ( {
        transform: () => ( { source: 'source' } ),
        toLocator: () => 'new-locator',
    } )
    `;

    const explorer = new Config<HealerConfig>( {
        fileNames: CONFIG_FILE_NAMES,
        fileSystem: vol,
    } );

    beforeEach( () => {
        vol.fromJSON( {
            [ `node_modules/${heuristicsPackage}/index.js` ]: heuristicsPackageContent,
            [ `node_modules/${healerPackage}/index.js` ]: healerPackageContent,
        } );
        patchRequire( vol );
    } );

    afterEach( () => {
        vol.reset();
    } );

    after( () => {
        patchRequire( fs );
    } );

    it( 'Should load config options from config file', async () => {
        const jsonFile: string = '.healerrc.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                heuristics: [
                    { from: heuristicsPackage, name: firstHeuristic },
                    { from: heuristicsPackage, name: secondHeuristic },
                ],
                healer: {
                    from: healerPackage,
                },
            } ),
        } );

        const expectedHeuristicsLength: number = 2;
        const options = await getOptions( explorer );

        expect( options ).to.be.not.empty;
        expect( options.heuristics ).to.have.length( expectedHeuristicsLength );

        const [ first, second ] = options.heuristics;

        expect( first.run( null ) ).to.be.equals( firstHeuristic );
        expect( second.run( null ) ).to.be.equals( secondHeuristic );
    } );

    it( 'Should throw an error if heuristic not found in heuristics package', () => {
        const jsonFile: string = 'healer.json';
        const otherHeuristic: string = 'other-heuristic';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                heuristics: [
                    {
                        from: heuristicsPackage,
                        name: otherHeuristic,
                    },
                ],
            } ),
        } );

        expect( getOptions( explorer ) ).to.eventually.be.rejectedWith(
            ConfigException,
            `The "${otherHeuristic}" heuristic was not found in "${heuristicsPackage}" package.`,
        );
    } );
} );
