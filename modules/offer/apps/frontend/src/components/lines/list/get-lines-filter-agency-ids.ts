import { type OrganizationFilter } from '@tmlmobilidade/go-offer-pckg-types';

/* * */

/** Selecting every organization leaves agencies unrestricted; otherwise selected organizations contribute their combined agencies. */
export function getLinesFilterAgencyIds(agencyIds: string[], organizations: OrganizationFilter[], selectedIds: string[]): string[] {
	const organizationIds = new Set(selectedIds);
	if (organizations.every(organization => organizationIds.has(organization._id))) return agencyIds;

	const organizationAgencyIds = new Set(organizations
		.filter(organization => organization.organization_type !== 'agency' && organization.organization_type !== 'other' && organizationIds.has(organization._id))
		.flatMap(organization => organization.agency_ids));

	return agencyIds.filter(agencyId => organizationAgencyIds.has(agencyId));
}
