import { Plugin } from 'concordialang-plugin';

import { Config, ConfigException } from '../config';
import { HealerConfig } from '../models';
import { Requirement } from '../requirement';
import { explorer } from './explorer';

export const getPlugin = async (
    configExplorer: Config<HealerConfig> = explorer,
): Promise<Plugin> => {
    const { plugin } = await configExplorer.load();

    if ( !plugin ) {
        throw new ConfigException( 'Plugin option not provided in configuration file.' );
    }

    const HealerPlugin: new ( options?: any ) => Plugin = await new Requirement( {
        onArray: ( plugins ) => {
            return plugins[ 0 ];
        },
    } )
        .find( plugin );

    if ( !HealerPlugin ) {
        throw new ConfigException( `The plugin was not found in "${plugin.from}" package.` );
    }

    return new HealerPlugin( plugin.options );
};
