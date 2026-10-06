import { FastifyService } from '@tmlmobilidade/go-clients-fastify';

import { listOrganizationsHandler } from './handlers/list-organizations.js';

const NAMESPACE = '/v1/organizations';

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get('/', listOrganizationsHandler);
		next();
	},
	{ prefix: NAMESPACE },
);
