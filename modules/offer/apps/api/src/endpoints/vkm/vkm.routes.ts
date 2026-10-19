/* * */

import { VkmController } from '@/endpoints/vkm/vkm.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const NAMESPACE = '/vkm';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.post(
			'/calculate',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.lines.scope, [PermissionCatalog.all.lines.actions.read]) },
			VkmController.calculate,
		);

		next();

		//
	},
	{ prefix: NAMESPACE },
);
