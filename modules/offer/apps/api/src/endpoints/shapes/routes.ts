/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { routePreviewHandler } from './handlers/route-preview.js';

/* * */

const NAMESPACE = '/shapes';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.post(
			'/route-preview',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			routePreviewHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
