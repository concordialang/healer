import ClientWeb from './client-web';
import loadConfig from './load-config';
import WSConnection from './ws-connection';

const CONFIG_FILE = '.healerrc.json';

const url = loadConfig( CONFIG_FILE );
const connection = new WSConnection( url );
const clientWeb = new ClientWeb( connection );

export default clientWeb;
