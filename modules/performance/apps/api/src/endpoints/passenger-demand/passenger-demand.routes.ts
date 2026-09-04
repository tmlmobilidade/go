/* * */

import { getPassengerDemandBaseline } from '@/endpoints/passenger-demand/controllers/get-demand-baseline.js';
import { getPassengerDemandBreakdown } from '@/endpoints/passenger-demand/controllers/get-demand-breakdown.js';
import { getPassengerDemandProductivity } from '@/endpoints/passenger-demand/controllers/get-demand-productivity.js';
import { getPassengerDemandRecords } from '@/endpoints/passenger-demand/controllers/get-demand-records.js';
import { getPassengerDemandSeries } from '@/endpoints/passenger-demand/controllers/get-demand-series.js';
import { getPassengerDemandSummary } from '@/endpoints/passenger-demand/controllers/get-demand-summary.js';
import { authorizationMiddleware, FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/passenger-demand';

/* * */

const server: FastifyInstance = FastifyService.getInstance().server;
const readAuthorization = authorizationMiddleware(
	PermissionCatalog.all.performance.scope,
	[PermissionCatalog.all.performance.actions.read],
);

server.register(
	(instance, opts, next) => {
		instance.get('/summary', { preHandler: readAuthorization }, getPassengerDemandSummary);
		instance.get('/series', { preHandler: readAuthorization }, getPassengerDemandSeries);
		instance.get('/breakdown', { preHandler: readAuthorization }, getPassengerDemandBreakdown);
		instance.get('/baseline', { preHandler: readAuthorization }, getPassengerDemandBaseline);
		instance.get('/records', { preHandler: readAuthorization }, getPassengerDemandRecords);
		instance.get('/productivity', { preHandler: readAuthorization }, getPassengerDemandProductivity);
		next();
	},
	{ prefix: NAMESPACE },
);

/* * */
