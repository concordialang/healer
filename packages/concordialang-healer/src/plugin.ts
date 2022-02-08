import { getPlugin } from '@concordialang-healer/core';
import { Plugin } from 'concordialang-plugin';

class HealerPlugin {
    private static plugin: Plugin = null;

    static async instance(): Promise<Plugin> {
        if ( !this.plugin ) {
            this.plugin = await getPlugin();
        }

        return this.plugin;
    }
}

export { HealerPlugin };
