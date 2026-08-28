/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDistrictHandler } from './handlers/get-district.js';
import { getLocalityHandler } from './handlers/get-locality.js';
import { getLocationHandler } from './handlers/get-location.js';
import { getMunicipalityHandler } from './handlers/get-municipality.js';
import { getParishHandler } from './handlers/get-parish.js';
import { listDistrictsHandler } from './handlers/list-districts.js';
import { listLocalitiesHandler } from './handlers/list-localities.js';
import { listMunicipalitiesHandler } from './handlers/list-municipalities.js';
import { listParishesHandler } from './handlers/list-parishes.js';

/* * */

const NAMESPACE = '/locations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		//

		instance.get('/location', getLocationHandler);

		instance.get('/districts', listDistrictsHandler);
		instance.get('/districts/:id', getDistrictHandler);

		instance.get('/localities', listLocalitiesHandler);
		instance.get('/localities/:id', getLocalityHandler);

		instance.get('/municipalities', listMunicipalitiesHandler);
		instance.get('/municipalities/:id', getMunicipalityHandler);

		instance.get('/parishes', listParishesHandler);
		instance.get('/parishes/:id', getParishHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
