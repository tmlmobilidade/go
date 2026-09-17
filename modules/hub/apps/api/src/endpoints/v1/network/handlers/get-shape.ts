/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';

const sampleShape = {
	_id: 'legacy-shape',
	agency_id: 'legacy-agency',
	encoded_polyline: undefined,
	extension: 0,
	geojson: {
		geometry: {
			coordinates: [],
			type: 'LineString',
		},
		properties: undefined,
		type: 'Feature',
	},
	points: [],
};

/**
 * Retrieves a stop by its ID from cache.
 * @param request The request object.
 * @param reply The reply object.
 */
export async function getShapeHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<typeof sampleShape>) {
	//

	return sendSuccessApiResponse(reply, sampleShape, {
		max_age: '1h',
	});
}
