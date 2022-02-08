import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';
import { patchRequire } from 'fs-monkey';
import { vol } from 'memfs';

import { Config, ConfigException } from '../../src/config';
import { CONFIG_FILE_NAMES } from '../../src/constants';
import { HealerConfig } from '../../src/models';
import { getPlugin } from '../../src/options/plugin';

use( chaiAsPromised );

describe( 'Get plugin', () => {
    const pluginPackage: string = 'plugin';
    const pluginContent: string = `
    module.exports = class Plugin {
        constructor(options) {
            this.options = options;
        }
    };
    `;

    const explorer = new Config<HealerConfig>( {
        fileNames: CONFIG_FILE_NAMES,
        fileSystem: vol,
        loaders: {
            '.json': ( path ) => {
                return JSON.parse( vol.readFileSync( path, { encoding: 'utf-8' } ) as string );
            },
        },
    } );

    beforeEach( () => {
        vol.fromJSON( {
            [ `node_modules/${pluginPackage}/index.js` ]: pluginContent,
        } );
        patchRequire( vol );
    } );

    afterEach( () => {
        vol.reset();
    } );

    after( () => {
        patchRequire( fs );
    } );

    it( 'Should get plugin from config file', async () => {
        const jsonFile: string = '.healerrc.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                plugin: {
                    from: pluginPackage,
                    options: {
                        test: true,
                    },
                },
            } ),
        } );

        const plugin = await getPlugin( explorer );

        expect( plugin ).to.be.not.null;
        expect( ( plugin as any ).options ).to.be.deep.equals( { test: true } );
    } );

    it( 'Should throw an error not found plugin in package', () => {
        const jsonFile: string = 'healerrc.json';

        vol.fromJSON( {
            [ jsonFile ]: JSON.stringify( {
                plugin: {
                    from: 'other-plugin',
                },
            } ),
        } );

        expect( getPlugin( explorer ) ).to.eventually.be.rejectedWith(
            ConfigException,
            'The plugin was not found in "other-plugin" package.',
        );
    } );
} );
