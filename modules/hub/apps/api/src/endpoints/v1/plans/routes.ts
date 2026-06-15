/* * */

import { getApprovedPlans } from '@/endpoints/v1/plans/get-approved-plans.js';
import { getGtfsCm } from '@/endpoints/v1/plans/get-gtfs-cm.js';
import { getGtfs } from '@/endpoints/v1/plans/get-gtfs.js';
import { type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';

/* * */

const namespace = '/v1/plans';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', getApprovedPlans);

		instance.get('/gtfs', getGtfs);

		instance.get('/gtfs/cm', getGtfsCm);

		next();
	},
	{ prefix: namespace },
);
