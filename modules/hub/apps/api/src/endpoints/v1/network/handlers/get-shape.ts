/* * */

import { readAgencyCache } from '@/utils/agency-cache.js';
import { getOrganization } from '@/utils/organization.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type HubV1ApiLine, type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';

/** Shapes are published as geometry on versioned pattern records. */
export async function getShapeHandler(request: FastifyRequest<{ Params: { shapeId: string } }>, reply: FastifyReply<unknown>) {
	//

	//
	// Retrieve the published data

	const { agency_ids: agencyIds } = getOrganization(request);
	for (const agencyId of new Set(agencyIds)) {
		const lines = await readAgencyCache<HubV1ApiLine[]>([agencyId], 'network:lines');
		const patternIds = [...new Set(lines.flatMap(entry => entry.data.flatMap(line => line.pattern_ids)))];
		for (let index = 0; index < patternIds.length; index += 100) {
			const groups = await Promise.all(patternIds.slice(index, index + 100).map(patternId => readAgencyCache<HubV1ApiPattern[]>([agencyId], `network:patterns:${patternId}`)));
			const patterns = groups.flat();
			const pattern = patterns.flatMap(entry => entry.data).find(pattern => pattern.shape_id === request.params.shapeId);
			if (!pattern) continue;
			return sendSuccessApiResponse(reply, {
				_id: pattern.shape_id,
				agency_id: pattern.agency_id,
				encoded_polyline: pattern.shape_polyline,
				extension: pattern.shape_extension,
			}, { max_age: '1h' });
		}
	}
	return sendErrorApiResponse(reply, { error: 'Shape not found', status_code: '404' });
}
