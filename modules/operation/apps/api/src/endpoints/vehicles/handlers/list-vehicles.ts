/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type VehiclesListFilters, VehiclesListFiltersSchema, type VehiclesListItem, VehiclesListItemSchema } from '@tmlmobilidade/go-operation-pckg-types';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';

/**
 * Retrieves vehicles matching the given filters.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listVehiclesHandler(request: FastifyRequest<{ Body: VehiclesListFilters }>, reply: FastifyReply<VehiclesListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: 'vehicles',
		values: request.body.agency_ids,
	});

	//
	// Validate the filters

	const validatedFilters = VehiclesListFiltersSchema.parse(request.body);

	//
	// Fetch vehicles matching the filters

	const foundVehicles = await goDb.operation.vehicles.findMany({
		agency_id: { $in: validatedFilters.agency_ids },
	});

	// const validatedVehicles = VehiclesListItemSchema.array().parse(foundVehicles);

	return sendSuccessApiResponse(reply, foundVehicles);
}
