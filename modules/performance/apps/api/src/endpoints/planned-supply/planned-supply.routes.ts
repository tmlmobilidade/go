/* * */

import { getPlannedSupplyBreakdown } from '@/endpoints/planned-supply/controllers/get-planned-supply-breakdown.js';
import { getPlannedSupplyDayProfiles } from '@/endpoints/planned-supply/controllers/get-planned-supply-day-profiles.js';
import { getPlannedSupplySeries } from '@/endpoints/planned-supply/controllers/get-planned-supply-series.js';
import { getPlannedSupplySummary } from '@/endpoints/planned-supply/controllers/get-planned-supply-summary.js';
import { getPlannedSupplyTimeProfile } from '@/endpoints/planned-supply/controllers/get-planned-supply-time-profile.js';
import { authorizationMiddleware, type FastifyInstance, FastifyService } from '@tmlmobilidade/fastify';
import { PermissionCatalog } from '@tmlmobilidade/types';

/* * */

const NAMESPACE = '/planned-supply';
const server: FastifyInstance = FastifyService.getInstance().server;
const readAuthorization = authorizationMiddleware(
	PermissionCatalog.all.performance.scope,
	[PermissionCatalog.all.performance.actions.read],
);

/* * */

server.register(
	(instance, opts, next) => {
		instance.get('/summary', { preHandler: readAuthorization }, getPlannedSupplySummary);
		instance.get('/series', { preHandler: readAuthorization }, getPlannedSupplySeries);
		instance.get('/breakdown', { preHandler: readAuthorization }, getPlannedSupplyBreakdown);
		instance.get('/time-profile', { preHandler: readAuthorization }, getPlannedSupplyTimeProfile);
		instance.get('/day-profiles', { preHandler: readAuthorization }, getPlannedSupplyDayProfiles);
		next();
	},
	{ prefix: NAMESPACE },
);

/* * */
