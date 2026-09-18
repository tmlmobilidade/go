/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Stop, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Creates a new Stop in the database
 * @param request The request object containing the stop data in the body
 * @param reply The reply object
 */
export async function createStopHandler(request: FastifyRequest<{ Body: StopsCreateRequest }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsCreateRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Generate a new stop ID

	const newStopId = await generateStopId();

	//
	// Find the location for this stop

	const foundDistrict = await locationsProvider.findDistrictByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundMunicipality = await locationsProvider.findMunicipalityByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundParish = await locationsProvider.findParishByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	const foundLocality = await locationsProvider.findLocalityByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);

	if (!foundMunicipality?._id) {
		return sendErrorApiResponse(reply, {
			error: 'No municipality found for the given coordinates.',
			status_code: '400',
		});
	}

	//
	// Check if the user has permission to create a stop in this municipality

	const hasPermission = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.create,
		permissions: request.permissions,
		resource_key: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: foundMunicipality._id,
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to create a stop in this municipality.',
			status_code: '401',
		});
	}

	//
	// Prepare the stop data

	const nowMs = Dates.now('utc').unix_milliseconds;

	const validatedStopData = StopSchema.parse({
		_id: newStopId,
		created_at: nowMs,
		created_by: request.me._id,
		district_id: foundDistrict?._id,
		latitude: validatedRequest.data.latitude,
		locality_id: foundLocality?._id,
		longitude: validatedRequest.data.longitude,
		municipality_id: foundMunicipality?._id,
		name: validatedRequest.data.name,
		parish_id: foundParish?._id,
		short_name: getStopShortName(validatedRequest.data.name),
		tts_name: getStopTtsName(validatedRequest.data.name),
		updated_at: nowMs,
		updated_by: request.me._id,
	});

	//
	// Insert the stop in the database

	const insertResult = await goDb.infrastructure.stops.insertOneUnsafe(validatedStopData);

	return sendSuccessApiResponse(reply, insertResult);
}
