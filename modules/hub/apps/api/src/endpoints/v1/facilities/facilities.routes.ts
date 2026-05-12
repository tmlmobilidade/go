/* * */

import { FacilitiesController } from '@/endpoints/v1/facilities/facilities.controller.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/facilities';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get('/', FacilitiesController.getFacilities);

		instance.get('/helpdesks', FacilitiesController.getHelpdesks);

		instance.get('/boat_stations', FacilitiesController.getBoatStations);

		instance.get('/light_rail_stations', FacilitiesController.getLightRailStations);

		instance.get('/subway_stations', FacilitiesController.getSubwayStations);

		instance.get('/train_stations', FacilitiesController.getTrainStations);

		instance.get('/pips', FacilitiesController.getPips);

		instance.get('/schools', FacilitiesController.getSchools);

		instance.get('/stores', FacilitiesController.getStores);

		next();
	},
	{ prefix: namespace },
);
