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

		// GET /organizations
		instance.get('/', OrganizationsController.getAll);

		// GET /organization/:id
		instance.get('/:id', { preHandler: authorizationMiddleware() }, OrganizationsController.getById);

		// PUT /organizations/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update) }, OrganizationsController.update);

		// POST /organizations/:id/image
		instance.post('/:id/image', { preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.update) }, OrganizationsController.uploadImage);

		// POST /organizations
		instance.post('/', { preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.create) }, OrganizationsController.create);

		// DELETE /organizations/:id/image
		instance.delete('/:id/:theme/image', { preHandler: authorizationMiddleware(PermissionCatalog.all.organizations.scope, PermissionCatalog.all.organizations.actions.delete) }, OrganizationsController.deleteImage);

		// GET /organizations/:id/logo
		instance.get('/:id/logo', { preHandler: authorizationMiddleware() }, OrganizationsController.getLogo);

		next();
	},
	{ prefix: NAMESPACE },
);
