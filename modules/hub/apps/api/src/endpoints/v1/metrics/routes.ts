/* * */

import { getDemandByAgencyByOperationalDate } from '@/endpoints/v1/metrics/controllers/get-demand-by-agency-by-operational-date.js';
import { getServiceMetricsAll } from '@/endpoints/v1/metrics/controllers/get-service-metrics-all.js';
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

server.register(
	(instance, opts, next) => {
		//

		instance.get('/service/all', getServiceMetricsAll);

		next();
	},
	{ prefix: namespace },
);
