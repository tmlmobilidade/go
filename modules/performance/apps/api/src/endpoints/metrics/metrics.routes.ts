/* * */

import { MetricsController } from '@/endpoints/metrics/metrics.controller.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/go-clients-fastify';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

const NAMESPACE = '/metrics';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			MetricsController.getMetric,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
