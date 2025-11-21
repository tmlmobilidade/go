/* * */

import { NetworkController } from '@/endpoints/network/network.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const namespace = '/network';

/* * */

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			NetworkController.getLines,
		);

		instance.get(
			'/patterns',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			NetworkController.getPatterns,
		);

		next();
	},
	{ prefix: namespace },
);
