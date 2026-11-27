/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type OrganizationFilter, OrganizationFilterSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { filterPermissionResourceValues, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/** Returns organization labels and agency memberships for the lines filter. */
export async function listOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<OrganizationFilter[]>) {
	//

	//
	// Exclude agency and other organizations and fetch only the filter fields

	const organizations = await goDb.core.organizations.aggregate([
		{ $match: { organization_type: { $nin: ['agency', 'other'] } } },
		{ $project: Object.fromEntries(Object.keys(OrganizationFilterSchema.shape).map(key => [key, 1])) },
	]);

	//
	// Limit agency memberships to the user's readable lines

	const result = OrganizationFilterSchema.array().parse(organizations)
		.filter(organization => organization.organization_type !== 'agency' && organization.organization_type !== 'other')
		.map(organization => ({
			...organization,
			agency_ids: filterPermissionResourceValues({
				action: PermissionCatalog.all.lines.actions.read,
				permissions: request.permissions,
				resourceKey: 'agency_ids',
				scope: PermissionCatalog.all.lines.scope,
				values: organization.agency_ids,
			}),
		})).sort((a, b) => a.long_name.localeCompare(b.long_name, 'pt', { sensitivity: 'base' }) || a._id.localeCompare(b._id));

	return sendSuccessApiResponse(reply, result);
}
