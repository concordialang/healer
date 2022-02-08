export interface DatabaseOptions {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    dbName?: string;
    type: 'postgresql' | 'sqlite';
}
