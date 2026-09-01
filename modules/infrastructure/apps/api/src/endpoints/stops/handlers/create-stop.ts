/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { getStopShortName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { type sStopsCreateRequest, StopsCreateRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { CreateStopSchema, type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { hasPermissionResource } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Creates a new stop
 * @param request Fastify request containing stop data in body
 * @param reply Fastify reply
 */
export async function createStopHandler(request: FastifyRequest<{ Body: StopsCreateRequest }>, reply: FastifyReply<Stop>) {
	//

	//
	// Validate the request body

	const validatedRequest = StopsCreateRequestSchema.parse(request.body);

	//
	// Generate a new stop ID

	const newStopId = await generateStopId();

	//
	// Find the location for this stop

	const foundDistrict = await locationsProvider.findDistrictByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundMunicipality = await locationsProvider.findMunicipalityByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundParish = await locationsProvider.findParishByGeo(validatedRequest.latitude, validatedRequest.longitude);
	const foundLocality = await locationsProvider.findLocalityByGeo(validatedRequest.latitude, validatedRequest.longitude);

	//
	// Check if the user has permission to read this stop

	const hasPermission = hasPermissionResource(request.permissions, {
		requiredPermission: { action: 'create', scope: 'stops' },
		requiredValue: foundMunicipality._id,
		resourceKey: 'municipality_ids',
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

	const fullStopData: Stop = {
		...validatedRequest,
		_id: newStopId,
		associated_patterns: [],
		created_at: nowMs,
		created_by: request.me._id,
		flags: [],
		is_deleted: false,
		is_locked: false,
		short_name: getStopShortName(validatedRequest.name),
		updated_at: nowMs,
		updated_by: request.me._id,
	};

	const result = await goDb.infrastructure.stops.insertOneUnsafe({
		...validatedRequest,
		_id: newStopId,
		associated_patterns: [],
		created_at: now,

		updated_at: now,
	});

	return sendSuccessApiResponse(reply, result);
}
