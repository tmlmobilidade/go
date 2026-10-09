/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getGeocodeHandler } from './handlers/get-geocode.js';
import { getPlanHandler } from './handlers/get-plan.js';

/* * */

const NAMESPACE = '/v1/motis';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/geocode', getGeocodeHandler);

		instance.get('/plan', getPlanHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
