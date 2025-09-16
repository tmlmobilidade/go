/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@tmlmobilidade/lib';

import { QuickLinksController } from './quick-links.controller.js';

/* * */

const NAMESPACE = '/quick-links';
const permission = Permissions.quick_links;

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		// GET /organizations
		instance.get('/', QuickLinksController.getAll);

		// GET /organization/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.read) }, QuickLinksController.getById);

		// PUT /organizations/:id
		instance.put('/:id', { preHandler: authorizationMiddleware(permission.scope, permission.actions.update) }, QuickLinksController.update);

		next();
	},
	{ prefix: NAMESPACE },
);
