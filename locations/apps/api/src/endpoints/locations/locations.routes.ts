/* * */

import { FastifyService } from '@tmlmobilidade/connectors';

import { LocationsController } from './locations.controller.js';

/* * */

const server = FastifyService.getInstance().server;
const namespace = '/locations';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /
		instance.get('/coordinates', LocationsController.findByCoordinates);

		// GET /districts
		instance.get('/districts', LocationsController.getDistricts);

		// GET /localities
		instance.get('/localities', LocationsController.getLocalities);

		// GET /municipalities
		instance.get('/municipalities', LocationsController.getMunicipalities);

		// GET /parishes
		instance.get('/parishes', LocationsController.getParishes);

		next();
	},
	{ prefix: namespace },
);
