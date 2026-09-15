/* * */

import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { listQuickLinksHandler } from './handlers/list-quick-links.js';

/* * */

const NAMESPACE = '/home';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/quick-links',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.home.scope, [PermissionCatalog.all.home.actions.read_links]) },
			listQuickLinksHandler,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
