/* * */

import { getGeocode } from '@/endpoints/v1/motis/controllers/get-geocode.js';
import { getPlan } from '@/endpoints/v1/motis/controllers/get-plan.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/motis';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/geocode', getGeocode);

		instance.get('/plan', getPlan);

		next();
	},
	{ prefix: namespace },
);
