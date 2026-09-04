/* * */

import { getNetworkAgencies } from '@/endpoints/network/controllers/get-network-agencies.js';
import { getNetworkLine } from '@/endpoints/network/controllers/get-network-line.js';
import { getNetworkLines } from '@/endpoints/network/controllers/get-network-lines.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/network';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/agencies',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getNetworkAgencies,
		);

		instance.get(
			'/lines',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getNetworkLines,
		);

		instance.get(
			'/lines/:lineId',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getNetworkLine,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
