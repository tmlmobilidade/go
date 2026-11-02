/* * */

import { resolveOrganization } from '@/utils/organization.js';
import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listAgenciesHandler } from './handlers/list-agencies.js';

/* * */

const NAMESPACE = '/v1/:organizationId/agencies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.addHook('preHandler', resolveOrganization);

		instance.get('/', listAgenciesHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
