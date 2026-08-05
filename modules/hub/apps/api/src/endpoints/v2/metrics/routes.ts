/* * */

import { getPassengerDemand } from '@/endpoints/v2/metrics/controllers/get-passenger-demand.js';
import { getDepartureDelays, getServiceCompliance, getVkmExecution } from '@/endpoints/v2/metrics/controllers/get-ride-metrics.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v2/metrics';
const server: FastifyInstance = FastifyService.getInstance().server;

/* * */

server.register(
	(instance, opts, next) => {
		//

		// Temporary response semantics: ./passenger-demand.md
		instance.get('/departure-delays', getDepartureDelays);
		instance.get('/passenger-demand', getPassengerDemand);
		instance.get('/service-compliance', getServiceCompliance);
		instance.get('/vkm-execution', getVkmExecution);

		next();
	},
	{ prefix: namespace },
);
