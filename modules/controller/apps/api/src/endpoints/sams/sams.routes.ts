/* * */

import { SamsController } from '@/endpoints/sams/sams.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/sams';

/* * */

const server = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.sams.scope, [PermissionCatalog.all.sams.actions.read]) },
			SamsController.getAll,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
