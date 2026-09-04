/* * */

import { buildPlannedSupplyQueryInput, type PlannedSupplyHttpQuery } from '@/endpoints/planned-supply/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPlannedSupplyDayProfiles } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PlannedSupplyDayProfiles } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns planned-supply profiles grouped by operational day type. */
export async function getPlannedSupplyDayProfiles(request: FastifyRequest<{ Querystring: PlannedSupplyHttpQuery }>, reply: FastifyReply<PlannedSupplyDayProfiles>) {
	const data = await queryPlannedSupplyDayProfiles(buildPlannedSupplyQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
