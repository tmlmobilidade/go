/* * */

import { WikiController } from '@/endpoints/wiki/wiki.controller.js';
import { authorizationMiddleware } from '@/middleware/authorization.middleware.js';
import { FastifyService } from '@tmlmobilidade/connectors';
import { Permissions } from '@go/lib';

/* * */

const server = FastifyService.getInstance().server;
const NAMESPACE = '/wiki';

/* * */

server.register(
	(instance, opts, next) => {
		// GET /wiki
		instance.get('/', { preHandler: authorizationMiddleware(Permissions.home.scope, Permissions.home.actions.read_wiki) }, WikiController.getAll);

		// GET /wiki/:id
		instance.get('/:id', { preHandler: authorizationMiddleware(Permissions.home.scope, Permissions.home.actions.read_wiki) }, WikiController.getById);

		next();
	},
	{ prefix: NAMESPACE },
);
