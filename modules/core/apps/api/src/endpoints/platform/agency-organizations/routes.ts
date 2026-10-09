/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listAgencyOrganizationsHandler } from './handlers/list-agency-organizations.js';

/* * */

const NAMESPACE = '/platform/agency-organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get('/', { preHandler: authorizationMiddleware() }, listAgencyOrganizationsHandler);

		next();
	},
	{ prefix: NAMESPACE },
);
