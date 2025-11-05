/* * */

import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/go-lib';

import { OrganizationsController } from './organizations.controller.js';

/* * */

const NAMESPACE = '/organizations';
const permission = Permissions.organizations;

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
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, OrganizationsController.update);

		// POST /organizations/:id/image
		instance.post('/:id/image', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, OrganizationsController.uploadImage);

		// POST /organizations
		instance.post('/', { preHandler: authorizationMiddleware(permission.scope, permission.actions.create) }, OrganizationsController.create);

		// DELETE /organizations/:id/image
		instance.delete('/:id/:theme/image', { preHandler: authorizationMiddleware(permission.scope, Permissions.organizations.actions.delete) }, OrganizationsController.deleteImage);

		// GET /organizations/:id/logo
		instance.get('/:id/logo', { preHandler: authorizationMiddleware() }, OrganizationsController.getLogo);

		next();
	},
	{ prefix: NAMESPACE },
);
