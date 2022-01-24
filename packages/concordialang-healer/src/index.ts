import { CodeceptJSPlaywrightHealer } from '@healer/codeceptjs-playwright';
import { afterReporting, getDatabaseOptions, initDatabase } from '@healer/lib';
import { Plugin } from 'concordialang-plugin';

export class ConcordiaHealer extends CodeceptJSPlaywrightHealer implements Plugin {
    async afterReporting(): Promise<void> {
        await initDatabase( await getDatabaseOptions() );
        await afterReporting();
    }
}
