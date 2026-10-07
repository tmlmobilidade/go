/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type StopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Stop, StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { type Location, locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
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

	let foundLocation: Location;

	try {
		foundLocation = await locationsProvider.findLocationByGeo(validatedRequest.data.latitude, validatedRequest.data.longitude);
	} catch (error) {
		return sendErrorApiResponse(reply, {
			error: error instanceof Error ? error.message : 'No location found for the given coordinates.',
			status_code: '400',
		});
	}

	//
	// Check if the user has permission to create a stop in this location

	const hasPermission = PermissionCatalog.hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.create,
		permissions: request.permissions,
		resource_key: 'location_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: locationSlotOsmIds(foundLocation),
	});

	if (!hasPermission) {
		return sendErrorApiResponse(reply, {
			error: 'User does not have permission to create a stop in this location.',
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
		latitude: validatedRequest.data.latitude,
		location: foundLocation,
		longitude: validatedRequest.data.longitude,
		name: validatedRequest.data.name,
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
