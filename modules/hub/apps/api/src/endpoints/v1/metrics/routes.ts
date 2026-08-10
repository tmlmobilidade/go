/* * */

import { getDemandByAgencyByOperationalDate } from '@/endpoints/v1/metrics/controllers/get-demand-by-agency-by-operational-date.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/metrics';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/demand-by-agency-by-operational-date', getDemandByAgencyByOperationalDate);

		next();
	},
	{ prefix: namespace },
);
