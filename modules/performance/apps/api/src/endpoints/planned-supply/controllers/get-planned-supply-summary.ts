/* * */

import { buildPlannedSupplyQueryInput, type PlannedSupplyHttpQuery } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplySummary } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplyMetrics } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns planned-supply totals for a line and period. */
export async function getPlannedSupplySummary(request: FastifyRequest<{ Querystring: PlannedSupplyHttpQuery }>, reply: FastifyReply<PlannedSupplyMetrics>) {
	const data = await queryPlannedSupplySummary(buildPlannedSupplyQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
