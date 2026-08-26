/* * */

import { buildPassengerDemandLineDashboardQueryInput, type PassengerDemandLineDashboardHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { queryPassengerDemandLineDashboard } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandLineDashboard } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandLineDashboard(
	request: FastifyRequest<{ Querystring: PassengerDemandLineDashboardHttpQuery }>,
	reply: FastifyReply<PassengerDemandLineDashboard>,
) {
	try {
		const input = buildPassengerDemandLineDashboardQueryInput(request.query);
		const dashboard = await queryPassengerDemandLineDashboard(input);
		const stops = await Promise.all(dashboard.contributions.stops.map(async (item) => {
			const numericId = Number(item.id);
			const stop = Number.isNaN(numericId)
				? await goDb.infrastructure.stops.findOne({ legacy_id: item.id })
				: await goDb.infrastructure.stops.findById(numericId);
			return { ...item, label: stop?.name };
		}));

		const data = {
			...dashboard,
			contributions: { ...dashboard.contributions, stops },
		};
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand line-dashboard query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand line-dashboard');
	}
}
