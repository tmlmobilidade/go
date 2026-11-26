/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDemandByAgencyByOperationalDateHandler } from './handlers/get-demand-by-agency-by-operational-date.js';
import { getVehicleEventsLast24hHandler } from './handlers/get-vehicle-events-last-24h.js';

/* * */

const NAMESPACE = '/v1/metrics';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/demand-by-agency-by-operational-date', getDemandByAgencyByOperationalDateHandler);

		instance.get('/vehicle-events/last-24h', getVehicleEventsLast24hHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
