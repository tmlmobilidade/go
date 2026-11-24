/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { listOrganizationsHandler } from './handlers/list-organizations.js';

/* * */

const NAMESPACE = '/organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			listOrganizationsHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
