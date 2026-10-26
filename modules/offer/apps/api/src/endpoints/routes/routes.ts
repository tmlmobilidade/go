/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { createRouteHandler } from './handlers/create-route.js';
import { deleteRouteHandler } from './handlers/delete-route.js';
import { getRouteHandler } from './handlers/get-route.js';
import { lockRouteHandler } from './handlers/lock-route.js';
import { updateRouteHandler } from './handlers/update-route.js';

/* * */

const NAMESPACE = '/routes';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			getRouteHandler,
		);

		instance.post(
			'/create',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.create]) },
			createRouteHandler,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			updateRouteHandler,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.lock]) },
			lockRouteHandler,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.delete]) },
			deleteRouteHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
