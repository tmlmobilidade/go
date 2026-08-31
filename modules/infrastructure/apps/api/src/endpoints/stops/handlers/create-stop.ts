/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { CreateStopSchema, type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Creates a new stop
 * @param request Fastify request containing stop data in body
 * @param reply Fastify reply
 */
export async function createStopHandler(request: FastifyRequest, reply: FastifyReply<Stop>) {
	//

	//
	// Parse the request body

	const data = CreateStopSchema.parse(request.body);

	const newStopId = await generateStopId();

	const now = Dates.now('utc').unix_milliseconds;

	const result = await goDb.infrastructure.stops.insertOneUnsafe({
		...data,
		_id: newStopId,
		associated_patterns: [],
		created_at: now,
		updated_at: now,
	});

	return sendSuccessApiResponse(reply, result);
}
