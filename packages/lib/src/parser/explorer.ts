import { Config } from '../config';
import { CONFIG_FILE_NAMES } from '../constants';
import { HealerConfig } from '../models';

export const explorer = new Config<HealerConfig>( { fileNames: CONFIG_FILE_NAMES } );
