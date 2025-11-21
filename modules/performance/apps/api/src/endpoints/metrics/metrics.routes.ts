/* * */

import { MetricsController } from '@/endpoints/metrics/metrics.controller.js';
import { authorizationMiddleware, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { FastifyInstance } from 'fastify';

/* * */

const NAMESPACE = '/metrics';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/:metricName',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			MetricsController.getMetric,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
