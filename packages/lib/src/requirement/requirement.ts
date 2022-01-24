import { fromDirname, requireDefault } from '../utils';
import { RequirementEntry } from './requirement-entry';

type OnArray<Entry, Data> = ( data: Data[], entry: Entry ) => Data;

export class Requirement<Entry extends RequirementEntry, Data = any> {
    private cache: Record<string, Data>;
    private dirname: string;
    private onArray: OnArray<Entry, Data>;

    constructor( params: {
        cache?: Record<string, Data>;
        dirname?: string;
        onArray: OnArray<Entry, Data>;
    } ) {
        this.cache = params.cache || {};
        this.dirname = params.dirname || process.cwd();
        this.onArray = params.onArray;
    }

    private async require( from: string ): Promise<Data> {
        if ( this.cache[ from ] ) {
            return this.cache[ from ];
        }
        const dirname: string = fromDirname( from, this.dirname );
        const data: Data = await requireDefault( dirname );

        this.cache[ from ] = data;

        return data;
    }

    public async find( entry: Entry ): Promise<Data> {
        const data: Data = await this.require( entry.from );
        const found: Data = Array.isArray( data ) ? this.onArray( data, entry ) : data;

        return found;
    }
}
