import { afterReporting, getDatabaseOptions, initDatabase } from '@concordialang-healer/lib';
import {
    AbstractTestScript,
    Plugin,
    TestScriptExecutionOptions,
    TestScriptGenerationOptions,
    TestScriptGenerationResult,
} from 'concordialang-plugin';
import { TestScriptExecutionResult } from 'concordialang-types';

import { HealerPlugin } from './plugin';

export class ConcordiaHealer implements Plugin {
    async generateCode(
        abstractTestScripts: AbstractTestScript[],
        options: TestScriptGenerationOptions,
    ): Promise<TestScriptGenerationResult> {
        return ( await HealerPlugin.instance() ).generateCode?.( abstractTestScripts, options );
    }

    async executeCode( options: TestScriptExecutionOptions ): Promise<TestScriptExecutionResult> {
        return ( await HealerPlugin.instance() ).executeCode?.( options );
    }

    async convertReportFile( filePath: string ): Promise<TestScriptExecutionResult> {
        return ( await HealerPlugin.instance() ).convertReportFile?.( filePath );
    }

    async defaultReportFile(): Promise<string> {
        return ( await HealerPlugin.instance() ).defaultReportFile?.();
    }

    async beforeReporting(
        result?: TestScriptExecutionResult,
        options?: TestScriptExecutionOptions,
    ): Promise<void> {
        return ( await HealerPlugin.instance() ).beforeReporting?.( result, options );
    }

    async afterReporting(): Promise<void> {
        await initDatabase( await getDatabaseOptions() );
        await afterReporting();
    }
}
