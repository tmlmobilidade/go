/* * */

import { FaresController } from '@/endpoints/fares/fares.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/fares';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			FaresController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.read]) },
			FaresController.getById,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.update]) },
			FaresController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.lock]) },
			FaresController.lock,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
