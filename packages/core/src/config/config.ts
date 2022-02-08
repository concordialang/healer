import fs from 'fs';
import { extname } from 'path';

import { fileExists, searchConfigFile } from '../utils';
import { ConfigException } from './config-exception';
import { defaultLoaders, Loaders } from './loaders';

export class Config<ConfigData = any> {
    private fileNames: string[];
    private loaders: Loaders;
    private fileSystem: any;
    private dirname: string;

    constructor( params: {
        fileNames: string[];
        dirname?: string;
        loaders?: Loaders;
        fileSystem?: any;
    } ) {
        this.fileNames = params.fileNames;
        this.loaders = params.loaders || defaultLoaders;
        this.fileSystem = params.fileSystem || fs;
        this.dirname = params.dirname || process.cwd();
    }

    public load(): Promise<ConfigData> {
        const configFile: string = searchConfigFile(
            this.fileNames,
            this.dirname,
            ( filePath: string ) => fileExists( filePath, this.fileSystem ),
        );

        if ( !configFile ) {
            throw new ConfigException( `Can not load config from ${this.fileNames.join( ', ' )}.` );
        }

        return this.loadConfigFromFile( configFile );
    }

    private loadConfigFromFile( filePath: string ): Promise<ConfigData> {
        const extension: string = extname( filePath );

        const loader = this.loaders[ extension ];

        if ( !loader ) {
            throw new ConfigException( `Config file ${filePath} can't be loaded` );
        }

        return loader( filePath );
    }
}
