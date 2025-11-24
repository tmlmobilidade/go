/* * */

import { NetworkController } from '@/endpoints/network/network.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const NAMESPACE = '/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			NetworkController.getUniqueLineIds,
		);

		instance.get(
			'/patterns',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			NetworkController.getUniquePatternIds,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
