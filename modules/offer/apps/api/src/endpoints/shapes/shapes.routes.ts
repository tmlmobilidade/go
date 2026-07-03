/* * */

import { ShapesController } from '@/endpoints/shapes/shapes.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/shapes';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		instance.post(
			'/route-preview',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			ShapesController.routePreview,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
