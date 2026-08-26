/* * */

import { RidePerformanceController } from '@/endpoints/ride-performance/ride-performance.controller.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/ride-performance';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const readAuthorization = authorizationMiddleware(
	PermissionCatalog.all.performance.scope,
	[PermissionCatalog.all.performance.actions.read],
);

server.register(
	(instance, opts, next) => {
		instance.get('/planned-supply-line-dashboard', { preHandler: readAuthorization }, RidePerformanceController.getPlannedSupplyLineDashboard);
		instance.get('/total', { preHandler: readAuthorization }, RidePerformanceController.getTotal);
		instance.get('/over-time', { preHandler: readAuthorization }, RidePerformanceController.getOverTime);
		instance.get('/by-line', { preHandler: readAuthorization }, RidePerformanceController.getByLine);
		instance.get('/by-pattern', { preHandler: readAuthorization }, RidePerformanceController.getByPattern);
		instance.get('/comparison', { preHandler: readAuthorization }, RidePerformanceController.getComparison);
		instance.get('/baseline-comparison', { preHandler: readAuthorization }, RidePerformanceController.getBaselineComparison);
		instance.get('/heatmap', { preHandler: readAuthorization }, RidePerformanceController.getHeatmap);
		next();
	},
	{ prefix: NAMESPACE },
);

/* * */
