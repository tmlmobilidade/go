/* * */

import { DatesController } from '@/endpoints/dates/dates.controller.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

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
			DatesController.getCalendar,
		);

		next();
	},
	{ prefix: namespace },
);
