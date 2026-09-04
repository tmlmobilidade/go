/* * */

import { buildPlannedSupplyQueryInput, type PlannedSupplyHttpQuery } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplyTimeProfile } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplyTimeProfile } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns weekday-by-hour planned-supply cells. */
export async function getPlannedSupplyTimeProfile(request: FastifyRequest<{ Querystring: PlannedSupplyHttpQuery }>, reply: FastifyReply<PlannedSupplyTimeProfile>) {
	const data = await queryPlannedSupplyTimeProfile(buildPlannedSupplyQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
