/* * */

import { requireOrganization } from '@/hooks/require-organization.js';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { getDemandByAgencyByOperationalDateHandler } from './handlers/get-demand-by-agency-by-operational-date.js';

/* * */

const NAMESPACE = '/v1/:organizationId/metrics';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.addHook('preHandler', requireOrganization);

		//

		instance.get('/demand-by-agency-by-operational-date', getDemandByAgencyByOperationalDateHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
