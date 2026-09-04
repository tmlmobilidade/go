/* * */

import { buildPlannedSupplyQueryInput, type PlannedSupplyHttpQuery } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplySeries } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplySeries } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns daily planned-supply points and totals. */
export async function getPlannedSupplySeries(request: FastifyRequest<{ Querystring: PlannedSupplyHttpQuery }>, reply: FastifyReply<PlannedSupplySeries>) {
	const data = await queryPlannedSupplySeries(buildPlannedSupplyQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
