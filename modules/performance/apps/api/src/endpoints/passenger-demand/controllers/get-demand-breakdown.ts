/* * */

import { buildPassengerDemandResourceBreakdownQueryInput, type PassengerDemandBreakdownHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { queryPassengerDemandBreakdown } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandBreakdown } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns passenger demand grouped by one allowlisted dimension. */
export async function getPassengerDemandBreakdown(
	request: FastifyRequest<{ Querystring: PassengerDemandBreakdownHttpQuery }>,
	reply: FastifyReply<PassengerDemandBreakdown>,
) {
	const input = buildPassengerDemandResourceBreakdownQueryInput(request.query);
	const breakdown = await queryPassengerDemandBreakdown(input);
	if (input.dimension !== 'stop') return reply.send({ data: breakdown, error: null, statusCode: HTTP_STATUS.OK });
	const items = await Promise.all(breakdown.items.map(async (item) => {
		const numericId = Number(item.id);
		const stop = Number.isNaN(numericId)
			? await goDb.infrastructure.stops.findOne({ legacy_id: item.id })
			: await goDb.infrastructure.stops.findById(numericId);
		return { ...item, label: stop?.name };
	}));
	return reply.send({ data: { ...breakdown, items }, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
