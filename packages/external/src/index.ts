/* * */

import { CcflClient } from './clients/ccfl/index.js';
import { CpClient } from './clients/cp/index.js';
import { CrtmAisaClient } from './clients/crtm-aisa/index.js';
import { FertagusClient } from './clients/fertagus/index.js';
import { MlClient } from './clients/ml/index.js';
import { MobiClient } from './clients/mobi/index.js';

/**
 * Collection of external transport agency clients.
 *
 * Each property provides a typed client to interact with the public API
 * of a specific transport agency. These clients offer methods to fetch
 * GTFS-RT feeds and other relevant live data where available.
 *
 * - ccfl: Companhia dos Caminhos de Ferro de Lisboa (CCFL) AKA Carris Munícipal API Client.
 * - cp: Comboios de Portugal (CP) API Client
 * - crtmAisa: Consorcio Regional de Transportes de Madrid (AISACRTM) API Client
 * - mobi: MobiCascais API Client
 * - ml: Metro Lisboa (ML) API Client
 */
export const externalClients = Object.freeze({
	ccfl: CcflClient,
	cp: CpClient,
	crtmAisa: CrtmAisaClient,
	fertagus: FertagusClient,
	ml: MlClient,
	mobi: MobiClient,
});
