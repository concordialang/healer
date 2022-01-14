import output from '../output';
import { getOptions } from '../parser';
import { init } from './init';
import { server } from './server';

output.program.version( process.env.npm_package_version );

output.program
    .command( '--init', { isDefault: true } )
    .option( '--init' )
    .description( 'Initialize the configuration file for healer (healerrc.json})' )
    .action( ( options ) => {
        if ( !options.init ) {
            output.program.help();
        }

        try {
            init();
        } catch ( error: any ) {
            output.error( error.message );
        }
    } );

output.program
    .command( 'server' )
    .description( 'Init healer server with settings from config file' )
    .action( async () => {
        try {
            server( await getOptions() );
        } catch ( error: any ) {
            output.error( error.message );
        }
    } );

output.program.parse( process.argv );
