/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';

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
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, OrganizationsController.getById);

		// PUT /organizations/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, OrganizationsController.update);

		next();
	},
	{ prefix: NAMESPACE },
);
