import fs from 'fs';
import { extname, join } from 'path';

import { ConfigException } from './config-exception';
import { Loaders, defaultLoaders } from './loaders';

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
        const configFile: string = this.searchConfigFile();

        if ( !configFile ) {
            throw new ConfigException( `Can not load config from ${this.fileNames.join( ', ' )}.` );
        }

        return this.loadConfigFromFile( configFile );
    }

    private isFile( filePath: string ): boolean {
        try {
            return this.fileSystem.lstatSync( filePath )
                .isFile();
        } catch ( error ) {
            return false;
        }
    }

    private loadConfigFromFile( filePath: string ): Promise<ConfigData> {
        const extension: string = extname( filePath );

        const loader = this.loaders[ extension ];

        if ( !loader ) {
            throw new ConfigException( `Config file ${filePath} can't be loaded` );
        }

        return loader( filePath );
    }

    private searchConfigFile(): string {
        for ( const configFile of this.fileNames ) {
            const filePath: string = join( this.dirname, configFile );

            if ( this.isFile( filePath ) ) {
                return filePath;
            }
        }

        return null;
    }
}
