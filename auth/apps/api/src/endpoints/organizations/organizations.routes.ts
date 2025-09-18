/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';
import { Organization } from '@tmlmobilidade/types';

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

		// GET /organization/:id§
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, OrganizationsController.getById);

		// PUT /organizations/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, OrganizationsController.update);

		// GET /alerts/:id/image
		instance.get(
			'/:id/:theme/image', { preHandler: authorizationMiddleware(permission.scope, Permissions.organizations.actions.read) }, OrganizationsController.getImage,
		);

		// POST /alerts/:id/image
		instance.post(
			'/:id/:theme/image', { preHandler: authorizationMiddleware(permission.scope, Permissions.organizations.actions.update) }, OrganizationsController.uploadImage,
		);

		// POST /alerts
		instance.post(
			'/',
			{ preHandler: authorizationMiddleware(Permissions.organizations.scope, Permissions.organizations.actions.create) }, OrganizationsController.create);

		// DELETE /alerts/:id/image
		instance.delete(
			'/:id/:theme/image', { preHandler: authorizationMiddleware(permission.scope, Permissions.organizations.actions.delete) }, OrganizationsController.deleteImage,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
