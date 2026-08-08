/* * */

import { getDemandByAgency } from '@/endpoints/metrics/controllers/get-demand-by-agency.js';
import { getDemandByLine } from '@/endpoints/metrics/controllers/get-demand-by-line.js';
import { getDemandByPattern } from '@/endpoints/metrics/controllers/get-demand-by-pattern.js';
import { MetricsController } from '@/endpoints/metrics/metrics.controller.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/metrics';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;

server.register(
	(instance, opts, next) => {
		//

		instance.get(
			'/demand_by_agency',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getDemandByAgency,
		);

		instance.get(
			'/demand_by_line',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getDemandByLine,
		);

		instance.get(
			'/demand_by_pattern',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			getDemandByPattern,
		);

		instance.get(
			'/:id',
			{ preHandler: authorizationMiddleware(PermissionCatalog.all.performance.scope, [PermissionCatalog.all.performance.actions.read]) },
			MetricsController.getMetric,
		);

		next();
	},
	{ prefix: NAMESPACE },
);
