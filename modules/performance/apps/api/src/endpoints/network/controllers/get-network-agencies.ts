/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { queryAvailablePassengerDemandAgencyIds } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PerformanceNetworkAgency, PerformanceNetworkAgencySchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/** Retrieve agencies represented in Performance data and enrich them with GO metadata. */
export async function getNetworkAgencies(request: FastifyRequest, reply: FastifyReply<PerformanceNetworkAgency[]>) {
	try {
		const metricAgencyIds = await queryAvailablePassengerDemandAgencyIds();
		const agencies = metricAgencyIds.length
			? await goDb.core.agencies.findMany(
				{ $or: [{ _id: { $in: metricAgencyIds } }, { code: { $in: metricAgencyIds } }] },
				{ projection: { _id: 1, code: 1, name: 1, public_name: 1, short_name: 1 } },
			)
			: [];
		const agencyByMetricId = new Map<string, typeof agencies[number]>();
		for (const agency of agencies) {
			agencyByMetricId.set(agency._id, agency);
			agencyByMetricId.set(agency.code, agency);
		}

		const responseByAgencyId = new Map<string, PerformanceNetworkAgency>();
		for (const metricAgencyId of metricAgencyIds) {
			const agency = agencyByMetricId.get(metricAgencyId);
			const agencyId = agency?._id ?? metricAgencyId;
			const current = responseByAgencyId.get(agencyId);
			if (current) {
				current.metric_ids.push(metricAgencyId);
				continue;
			}
			responseByAgencyId.set(agencyId, PerformanceNetworkAgencySchema.parse({
				_id: agencyId,
				code: agency?.code ?? metricAgencyId,
				metric_ids: [metricAgencyId],
				name: agency?.name ?? metricAgencyId,
				public_name: agency?.public_name ?? agency?.name ?? metricAgencyId,
				short_name: agency?.short_name ?? agency?.code ?? metricAgencyId,
			}));
		}

		const data = [...responseByAgencyId.values()].sort((a, b) => a.public_name.localeCompare(b.public_name, 'pt-PT'));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error retrieving Performance agencies' });
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve Performance agencies');
	}
}

/* * */
