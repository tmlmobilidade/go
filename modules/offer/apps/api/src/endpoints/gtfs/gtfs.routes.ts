/* * */

import { GtfsController } from '@/endpoints/gtfs/gtfs.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const NAMESPACE = '/gtfs';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/parse',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			GtfsController.parse,
		);

		next();

		//
	},
	{ prefix: NAMESPACE },
);

