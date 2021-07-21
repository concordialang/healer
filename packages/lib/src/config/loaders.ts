import { requireDefault } from '../utils';

type LoaderFn = ( filepath: string ) => any;

interface Loaders {
    [extension: string]: LoaderFn;
}

const loadJson = requireDefault;

const loadJs = requireDefault;

const loadTs = requireDefault;

const defaultLoaders: Loaders = {
    '.js': loadJs,
    '.ts': loadTs,
    '.json': loadJson,
};

export { Loaders, LoaderFn, defaultLoaders };
