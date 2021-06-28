import { requireDefault } from '../util';
import { RequirementData } from './requirement-data';
import { arrayFind, fromDirname, onInvalid, validate } from './requirement-default';
import { RequirementEntry } from './requirement-entry';

export class Requirement<Data extends RequirementData> {
    private cache: Record<string, Data | Data[]>;
    private dirname: string;

    constructor(
        params: {
            cache?: Record<string, Data | Data[]>;
            dirname?: string;
        } = {},
    ) {
        this.cache = params.cache || {};
        this.dirname = params.dirname || process.cwd();
    }

    private async require( req: RequirementEntry ): Promise<Data | Data[]> {
        if ( this.cache[ req.from ] ) {
            return this.cache[ req.from ];
        }
        const dirname: string = fromDirname( req.from, this.dirname );
        const data: Data | Data[] = ( await requireDefault( dirname ) ) as Data | Data[];

        this.cache[ req.from ] = data;

        return data;
    }

    public async find( req: RequirementEntry ): Promise<Data> {
        const data: Data | Data[] = await this.require( req );
        const finded: Data = Array.isArray( data ) ? arrayFind( data, req ) as Data : data;

        if ( !validate( finded, req ) ) {
            onInvalid( req );
        }

        return finded;
    }
}
