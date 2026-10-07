/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsGetLocationRequest, StopsGetLocationRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { Location } from '@tmlmobilidade/go-types-locations';

/**
 * Returns the administrative location for a pair of coordinates.
 * @param request The request object containing the latitude and longitude in the body
 * @param reply The reply object
 */
export async function getStopLocationHandler(request: FastifyRequest<{ Body: StopsGetLocationRequest }>, reply: FastifyReply<Location>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsGetLocationRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Find the location

	try {
		const foundLocation = await locationsProvider.findLocationByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
		return sendSuccessApiResponse(reply, foundLocation);
	} catch (error) {
		return sendErrorApiResponse(reply, {
			error: error instanceof Error ? error.message : 'No location found for the given coordinates.',
			status_code: '404',
		});
	}
}
