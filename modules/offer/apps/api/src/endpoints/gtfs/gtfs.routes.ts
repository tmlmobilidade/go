/* * */

import { GtfsController } from '@/endpoints/gtfs/gtfs.controller.js';
import { ExporterSharedController } from '@tmlmobilidade/controllers';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

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

		instance.post(
			'/create-export',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.update]) },
			ExporterSharedController.create,
		);

		next();

		//
	},
	{ prefix: NAMESPACE },
);

