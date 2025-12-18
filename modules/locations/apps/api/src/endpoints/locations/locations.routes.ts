/* * */

import { LocationsController } from '@/endpoints/locations/locations.controller.js';
import { FastifyService } from '@tmlmobilidade/fastify';

/* * */

const NAMESPACE = '/locations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, _, next) => {
		//

		instance.get('/coordinates', LocationsController.findByCoordinates);

		instance.get('/districts', LocationsController.getDistricts);

		instance.get('/localities', LocationsController.getLocalities);

		instance.get('/municipalities', LocationsController.getMunicipalities);

		instance.get('/parishes', LocationsController.getParishes);

		next();
	},
	{ prefix: NAMESPACE },
);
