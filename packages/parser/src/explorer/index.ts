import { Config as HealerConfig } from '@healer/models';

import { Config } from '../config';

export const FILE_NAMES: string[] = [
    '.healerrc.json',
    'healer.json',
    '.healerrc.js',
    'healer.js',
    '.healerrc.ts',
    'healer.ts',
];

export const explorer = new Config<HealerConfig>( { fileNames: FILE_NAMES } );
