export class RequirementException extends Error {
    constructor( message: string ) {
        super( message );
        this.name = 'RequirementException';
    }
}
