/* * */

import { getPassengerDemandByLine } from '@/endpoints/passenger-demand/controllers/get-demand-by-line.js';
import { getPassengerDemandByPattern } from '@/endpoints/passenger-demand/controllers/get-demand-by-pattern.js';
import { getPassengerDemandByStop } from '@/endpoints/passenger-demand/controllers/get-demand-by-stop.js';
import { getPassengerDemandComparison } from '@/endpoints/passenger-demand/controllers/get-demand-comparison.js';
import { getPassengerDemandOverTime } from '@/endpoints/passenger-demand/controllers/get-demand-over-time.js';
import { getPassengerDemandTotal } from '@/endpoints/passenger-demand/controllers/get-demand-total.js';
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
		instance.get('/total', { preHandler: readAuthorization }, getPassengerDemandTotal);
		instance.get('/over-time', { preHandler: readAuthorization }, getPassengerDemandOverTime);
		instance.get('/by-line', { preHandler: readAuthorization }, getPassengerDemandByLine);
		instance.get('/by-pattern', { preHandler: readAuthorization }, getPassengerDemandByPattern);
		instance.get('/by-stop', { preHandler: readAuthorization }, getPassengerDemandByStop);
		instance.get('/comparison', { preHandler: readAuthorization }, getPassengerDemandComparison);
		next();
	},
	{ prefix: NAMESPACE },
);

/* * */
