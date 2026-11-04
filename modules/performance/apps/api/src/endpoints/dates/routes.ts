import { getCalendarHandler } from './handlers/get-calendar.js';
/* * */

import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/dates';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getCalendarHandler,
		);

		next();
	},
	{ prefix: namespace },
);
