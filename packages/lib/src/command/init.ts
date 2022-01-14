import fs from 'fs';
import { join } from 'path';

import { CONFIG_FILE_NAMES, DEFAULT_CONFIG_FILE_NAME } from '../constants';
import { HealerConfig } from '../models';
import { colors, error, print, success } from '../output';
import { fileExists, searchConfigFile } from '../utils';

type InitOptions = {
    path: string;
    fileSystem: any;
};

const defaultConfig: HealerConfig = {
    heuristics: [
        {
            name: 'by-id',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
        {
            name: 'by-classes',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
        {
            name: 'by-attributes',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
        {
            name: 'by-tag',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
        {
            name: 'by-xpath',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
        {
            name: 'by-text',
            from: '@healer/heuristics-web/heuristics',
            options: {},
        },
    ],
    healer: {
        from: '@healer/heuristics-web/healer',
        options: {},
    },
    database: {
        type: 'sqlite',
        dbName: ':memory:',
        host: 'localhost',
        port: null,
        user: null,
        password: null,
    },
    server: {
        port: 5000,
    },
};

const configIndentSize: number = 2;

export const init = (
    { path, fileSystem }: InitOptions = {
        path: process.cwd(),
        fileSystem: fs,
    },
): string => {
    print();
    print( `  It will prepare ${colors.magenta.bold( 'Healer' )} config for you` );
    print();

    const isFile = ( filePath: string ): boolean => fileExists( filePath, fileSystem );
    const configFile = searchConfigFile( CONFIG_FILE_NAMES, path, isFile );

    if ( configFile ) {
        error( `You already have a configuration file at ${configFile}` );

        return null;
    }

    const configPath: string = join( path, DEFAULT_CONFIG_FILE_NAME );
    const configContent: string = JSON.stringify( defaultConfig, null, configIndentSize );

    fileSystem.writeFileSync( configPath, configContent );

    print( `Config created at ${configPath}` );
    print();
    success( 'Healer is ready to use! ;)' );

    return configPath;
};
