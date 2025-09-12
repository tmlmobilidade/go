/* * */

import { AgenciesController } from '@/endpoints/agencies/agencies.controller.js';
import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';

/* * */

const NAMESPACE = '/organizations';
const permission = Permissions.organizations;

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /agencies
		instance.get('/', AgenciesController.getAll);

		// GET /agencies/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, AgenciesController.getById);

		next();
	},
	{ prefix: NAMESPACE },
);
