/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsGetLocationRequest, StopsGetLocationRequestSchema, type StopsGetLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';

/**
 * Returns the administrative location for a pair of coordinates.
 * @param request The request object containing the latitude and longitude in the body
 * @param reply The reply object
 */
export async function getStopLocationHandler(request: FastifyRequest<{ Body: StopsGetLocationRequest }>, reply: FastifyReply<StopsGetLocationResponse>) {
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

	const foundDistrict = await locationsProvider.findDistrictByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundMunicipality = await locationsProvider.findMunicipalityByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundParish = await locationsProvider.findParishByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundLocality = await locationsProvider.findLocalityByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);

	//
	// Return the response

	return sendSuccessApiResponse(reply, {
		district: foundDistrict,
		locality: foundLocality,
		municipality: foundMunicipality,
		parish: foundParish,
	});
}
