/* * */

import { buildPlannedSupplyBreakdownQueryInput, type PlannedSupplyHttpQuery } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplyBreakdown } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplyBreakdown } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns planned supply grouped by one allowlisted dimension. */
export async function getPlannedSupplyBreakdown(request: FastifyRequest<{ Querystring: PlannedSupplyHttpQuery }>, reply: FastifyReply<PlannedSupplyBreakdown>) {
	const data = await queryPlannedSupplyBreakdown(buildPlannedSupplyBreakdownQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
