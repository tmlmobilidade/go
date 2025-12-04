/* * */

import { WikiController } from '@/endpoints/wiki/wiki.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/wiki';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_wiki]) },
			WikiController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_wiki]) },
			WikiController.getById,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
