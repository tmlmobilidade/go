/* * */

import { OrganizationsController } from '@/endpoints/organizations/organizations.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/organizations';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware() },
			OrganizationsController.getAll,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware() },
			OrganizationsController.getById,
		);

		instance.put(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			OrganizationsController.update,
		);

		instance.post(
			'/:id/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.update]) },
			OrganizationsController.uploadImage,
		);

		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.create]) }, OrganizationsController.create);

		instance.delete(
			'/:id/:theme/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			OrganizationsController.deleteImage,
		);

		instance.get(
			'/:id/logo',
			{ preHandler: authorizationMiddleware() },
			OrganizationsController.getLogo,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
