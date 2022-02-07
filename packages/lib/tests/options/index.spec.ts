import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';

import { Config, ConfigException } from '../../src/config';
import { CONFIG_FILE_NAMES } from '../../src/constants';
import { HealerConfig } from '../../src/models';
import { getOptions } from '../../src/options';

use( chaiAsPromised );

describe( 'Get Options', () => {
    const firstHeuristic: string = 'first-heuristic';
    const secondHeuristic: string = 'second-heuristic';

    const heuristicsPackage: string = 'heuristics';
    const heuristicsPackageContent: string = `
    module.exports = [
        () => ( { name: '${firstHeuristic}', run: () => '${firstHeuristic}' } ),
        () => ( { name: '${secondHeuristic}', run: () => '${secondHeuristic}' } ),
    ]
    `;
    const parserPackage: string = 'parser';
    const parserPackageContent: string = `
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
            [ `node_modules/${parserPackage}/index.js` ]: parserPackageContent,
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
                parser: {
                    from: parserPackage,
                },
                minimumScore: 0.5,
            } ),
        } );

        const expectedHeuristicsLength: number = 2;
        const options = await getOptions( explorer );

        expect( options ).to.be.not.empty;
        expect( options.healer.heuristics ).to.have.length( expectedHeuristicsLength );

        const [ first, second ] = options.healer.heuristics;

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

    it( 'Should throw an error if minimumScore not provided', () => {
        const jsonFile: string = 'healer.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                heuristics: [
                    { from: heuristicsPackage, name: firstHeuristic },
                    { from: heuristicsPackage, name: secondHeuristic },
                ],
                parser: {
                    from: parserPackage,
                },
                minimumScore: 0.5,
            } ),
        } );

        expect( getOptions( explorer ) ).to.eventually.be.rejectedWith(
            ConfigException,
            'MinimumScore option not provided in configuration file.',
        );
    } );

    it( 'Should throw an error if minimumScore is less than 0', () => {
        const jsonFile: string = 'healer.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                heuristics: [
                    { from: heuristicsPackage, name: firstHeuristic },
                    { from: heuristicsPackage, name: secondHeuristic },
                ],
                parser: {
                    from: parserPackage,
                },
                minimumScore: -0.1,
            } ),
        } );

        expect( getOptions( explorer ) ).to.eventually.be.rejectedWith(
            ConfigException,
            'The minimumScore option must be between 0 and 1.',
        );
    } );

    it( 'Should throw an error if minimumScore is grater than 1', () => {
        const jsonFile: string = 'healer.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                heuristics: [
                    { from: heuristicsPackage, name: firstHeuristic },
                    { from: heuristicsPackage, name: secondHeuristic },
                ],
                parser: {
                    from: parserPackage,
                },
                minimumScore: 1.1,
            } ),
        } );

        expect( getOptions( explorer ) ).to.eventually.be.rejectedWith(
            ConfigException,
            'The minimumScore option must be between 0 and 1.',
        );
    } );
} );
