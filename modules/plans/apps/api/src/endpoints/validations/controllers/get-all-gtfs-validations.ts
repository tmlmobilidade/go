/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidation, PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Retrieves all GTFS Validation objects, filtered
 * by user permissions and sorted by creation date.
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function getAllGtfsValidations(request: FastifyRequest, reply: FastifyReply<GtfsValidation[]>) {
	//

	//
	// Get the resource permissions for
	// GTFS Validations for the current user.

	const userGtfsValidationPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.gtfs_validations.scope, PermissionCatalog.all.gtfs_validations.actions.read);

	//
	// If specific agency permissions are set,
	// setup the database filters accordingly.

	const queryFilters: Filter<GtfsValidation> = {};

	//
	// If agency IDs are specified and do not include the ALLOW_ALL_FLAG,
	// filter validations by those agency IDs.

	if ('resources' in userGtfsValidationPermissions && 'agency_ids' in userGtfsValidationPermissions.resources) {
		if (!userGtfsValidationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			queryFilters['agency_id'] = { $in: userGtfsValidationPermissions.resources['agency_ids'] };
		}
	}

	if ('resources' in userGtfsValidationPermissions) {
		const filters = {
			...(userGtfsValidationPermissions.resources['agency_ids'] && !userGtfsValidationPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG) && { agency_id: { $in: userGtfsValidationPermissions.resources['agency_ids'] } }),
		};

		const filteredgtfsValidations = await goDb.operation.gtfsValidations.findMany(filters, { sort: { created_at: -1 } });

		return reply.send({ data: filteredgtfsValidations, error: null, statusCode: HTTP_STATUS.OK });
	}

	//
	// If no specific permissions are set, return all gtfsValidations

	const allgtfsValidations = await goDb.operation.gtfsValidations.findMany({}, { sort: { created_at: -1 } });

	return reply.send({ data: allgtfsValidations, error: null, statusCode: HTTP_STATUS.OK });

	//
}
