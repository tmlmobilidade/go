/* * */

import { FaresController } from '@/endpoints/fares/fares.controller.js';
import { catalogReadPermissionMiddleware } from '@/middleware/catalog-read-authorization.js';
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
			{ preHandler: [authorizationMiddleware(), catalogReadPermissionMiddleware('fares')] },
			FaresController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: [authorizationMiddleware(), catalogReadPermissionMiddleware('fares')] },
			FaresController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.create]) },
			FaresController.create,
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

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.fares.scope, [PermissionCatalog.all.fares.actions.delete]) },
			FaresController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
