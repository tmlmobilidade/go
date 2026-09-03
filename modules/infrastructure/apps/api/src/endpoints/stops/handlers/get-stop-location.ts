/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsGetLocationRequest, StopsGetLocationRequestSchema, type StopsGetLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';

/**
 * Gets the location of a stop.
 * @param request Fastify request containing stop latitude and longitude in body
 * @param reply Fastify reply
 */
export async function getStopLocationHandler(request: FastifyRequest<{ Body: StopsGetLocationRequest }>, reply: FastifyReply<StopsGetLocationResponse>) {
	//

	//
	// Parse the request body

	const validatedRequest = StopsGetLocationRequestSchema.parse(request.body);

	//
	// Find the location

	const foundDistrict = await locationsProvider.findDistrictByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundMunicipality = await locationsProvider.findMunicipalityByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundParish = await locationsProvider.findParishByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundLocality = await locationsProvider.findLocalityByGeo(validatedRequest.latitude, validatedRequest.longitude);

	//
	// Return the response

	return sendSuccessApiResponse(reply, {
		district: foundDistrict,
		locality: foundLocality,
		municipality: foundMunicipality,
		parish: foundParish,
	});
}
