/* * */

import { TypologiesController } from '@/endpoints/typologies/typologies.controller.js';
import { catalogReadPermissionMiddleware } from '@/middleware/catalog-read-authorization.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/typologies';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: [authorizationMiddleware(), catalogReadPermissionMiddleware('typologies')] },
			TypologiesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: [authorizationMiddleware(), catalogReadPermissionMiddleware('typologies')] },
			TypologiesController.getById,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.create]) },
			TypologiesController.create,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.update]) },
			TypologiesController.update,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.lock]) },
			TypologiesController.lock,
		);

		instance.delete(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.typologies.scope, [PermissionCatalog.all.typologies.actions.delete]) },
			TypologiesController.delete,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
