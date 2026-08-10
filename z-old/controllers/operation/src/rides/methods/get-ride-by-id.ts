/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { ridesProvider } from '@tmlmobilidade/go-providers-rides';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { type ActionsOf, type Permission, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get a Ride by ID.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getRideById<S extends Permission['scope']>(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Ride>, scope: S, action: ActionsOf<S>) {
	//

	//
	// Check if there is a ride ID in the request params.

	if (!request.params.id) {
		return reply.send({ data: null, error: 'No ride ID provided', statusCode: HTTP_STATUS.BAD_REQUEST });
	}

	//
	// Detect which agency_ids the user has access to,
	// based on their permissions. If none, return an empty array.

	const ridesPermission = PermissionCatalog.get(request.permissions, scope, action);

	if (!ridesPermission) throw new Error(`No permissions found for scope: ${scope} and action: ${action}`);

	if (!ridesPermission['resources']?.agency_ids?.length) throw new Error(`No agency_ids found in permissions for scope: ${scope} and action: ${action}`);

	const allowAllAgencies = ridesPermission['resources'].agency_ids.includes(PermissionCatalog.ALLOW_ALL_FLAG);

	//
	// If search is provided, immediately try to find the ride by ID.
	// If found, return it as the only result. This optimizes
	// for the common case of searching by ride ID.

	const foundRideById = await ridesProvider.findRideById(request.params.id);

	if (foundRideById && !allowAllAgencies && !ridesPermission['resources'].agency_ids.includes(foundRideById.agency_id)) {
		return reply.send({ data: null, error: 'User is not allowed to access this ride (not in allowed agency_ids)', statusCode: HTTP_STATUS.FORBIDDEN });
	}

	if (foundRideById) {
		// const normalizedRide = ridesProvider.normalizeRide(foundRideById);
		return reply.send({ data: foundRideById, error: null, statusCode: HTTP_STATUS.OK });
	}
}
