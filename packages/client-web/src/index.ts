import ClientWeb from './client-web';
import loadConfig from './load-config';
import WSConnection from './ws-connection';

const CONFIG_FILE = '.healerrc.json';

const config = loadConfig( CONFIG_FILE );
const connection = new WSConnection( config.server );
const clientWeb = new ClientWeb( connection );

export default clientWeb;
