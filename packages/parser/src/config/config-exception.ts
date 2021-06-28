export class ConfigException extends Error {
    constructor( message: string ) {
        super( message );
        this.name = 'ConfigException';
    }
}
