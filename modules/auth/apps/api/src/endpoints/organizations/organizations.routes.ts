/* * */

import { OrganizationsController } from '@/endpoints/organizations/organizations.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
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
			OrganizationsController.getAll,
		);

		instance.get(
			'/:id',
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
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			OrganizationsController.delete,
		);

		instance.delete(
			'/:id/:theme/image',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.delete]) },
			OrganizationsController.deleteImage,
		);

		instance.get(
			'/:id/logo',
			OrganizationsController.getLogo,
		);

		instance.get(
			'/:id/lock',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, [PermissionCatalog.all.organizations.actions.lock]) },
			OrganizationsController.lock,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
