/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDistrictById } from './controller/get-district-by-id.js';
import { getDistricts } from './controller/get-districts.js';
import { getLocalities } from './controller/get-localities.js';
import { getLocalityById } from './controller/get-locality-by-id.js';
import { getLocation } from './controller/get-location.js';
import { getMunicipalities } from './controller/get-municipalities.js';
import { getMunicipalityById } from './controller/get-municipality-by-id.js';
import { getParishById } from './controller/get-parish-by-id.js';
import { getParishes } from './controller/get-parishes.js';

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
