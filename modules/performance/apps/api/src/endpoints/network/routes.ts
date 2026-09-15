/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { listLinesHandler } from './handlers/list-lines.js';
import { listPatternsHandler } from './handlers/list-patterns.js';

/* * */

const NAMESPACE = '/network';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			listLinesHandler,
		);

		instance.get(
			'/patterns',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			listPatternsHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
