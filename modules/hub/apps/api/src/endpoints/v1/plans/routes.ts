/* * */

import { requireOrganization } from '@/hooks/require-organization.js';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getApprovedPlansHandler } from './handlers/get-approved-plans.js';
import { getGtfsHandler } from './handlers/get-gtfs.js';

/* * */

const NAMESPACE = '/v1/:organizationId/plans';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.addHook('preHandler', requireOrganization);

		//

		instance.get('/', getApprovedPlansHandler);

		instance.get('/gtfs', getGtfsHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
