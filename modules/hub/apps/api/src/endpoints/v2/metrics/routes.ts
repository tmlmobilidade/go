/* * */

import { getPassengerDemand } from '@/endpoints/v2/metrics/controllers/get-passenger-demand.js';
import { getVideowall } from '@/endpoints/v2/metrics/controllers/get-videowall.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v2/metrics';
const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	(instance, opts, next) => {
		//

		// Temporary response semantics: ./passenger-demand.md
		instance.get('/passenger-demand', getPassengerDemand);
		instance.get('/videowall', getVideowall);

		next();
	},
	{ prefix: namespace },
);
