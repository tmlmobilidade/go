/* * */

import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDemandByAgencyByOperationalDateHandler } from './handlers/get-demand-by-agency-by-operational-date.js';

/* * */

const NAMESPACE = '/v1/metrics';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/demand-by-agency-by-operational-date', getDemandByAgencyByOperationalDateHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
