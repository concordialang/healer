import { Config } from '../config';
import { HealerConfig } from './healer-config';

export const FILE_NAMES: string[] = [
    '.healerrc.json',
    'healer.json',
    '.healerrc.js',
    'healer.js',
    '.healerrc.ts',
    'healer.ts',
];

export const explorer = new Config<HealerConfig>( { fileNames: FILE_NAMES } );
