import { CodeceptJS, TestScriptExecutor } from 'concordialang-codeceptjs-core';

import { PlaywrightHelperConfiguration } from './helper-configuration';

export default class CodeceptJSPlaywrightHealer extends CodeceptJS {
    protected createTestScriptExecutor(): TestScriptExecutor {
        return new TestScriptExecutor( [ new PlaywrightHelperConfiguration() ] );
    }
}
