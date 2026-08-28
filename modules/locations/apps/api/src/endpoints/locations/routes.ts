/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDistrictById } from './handlers/get-district-by-id.js';
import { getDistricts } from './handlers/get-districts.js';
import { getLocalities } from './handlers/get-localities.js';
import { getLocalityById } from './handlers/get-locality-by-id.js';
import { getLocation } from './handlers/get-location.js';
import { getMunicipalities } from './handlers/get-municipalities.js';
import { getMunicipalityById } from './handlers/get-municipality-by-id.js';
import { getParishById } from './handlers/get-parish-by-id.js';
import { getParishes } from './handlers/get-parishes.js';

/* * */

const NAMESPACE = '/locations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		//

		instance.get('/location', getLocation);

		instance.get('/districts', getDistricts);
		instance.get('/districts/:id', getDistrictById);

		instance.get('/localities', getLocalities);
		instance.get('/localities/:id', getLocalityById);

		instance.get('/municipalities', getMunicipalities);
		instance.get('/municipalities/:id', getMunicipalityById);

		instance.get('/parishes', getParishes);
		instance.get('/parishes/:id', getParishById);

		next();
	},
	{ prefix: NAMESPACE },
);
