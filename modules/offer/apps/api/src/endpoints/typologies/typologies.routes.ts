/* * */

import { TypologiesController } from '@/endpoints/typologies/typologies.controller.js';
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
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.typologies.actions.nav], scope: PermissionCatalog.all.typologies.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
			TypologiesController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware([
				{ actions: [PermissionCatalog.all.typologies.actions.nav], scope: PermissionCatalog.all.typologies.scope },
				{ actions: [PermissionCatalog.all.lines.actions.read, PermissionCatalog.all.lines.actions.update], scope: PermissionCatalog.all.lines.scope },
			]) },
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
