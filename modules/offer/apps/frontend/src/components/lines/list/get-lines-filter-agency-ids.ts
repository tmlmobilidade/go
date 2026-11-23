import { type OrganizationFilter } from '@tmlmobilidade/go-offer-pckg-types';

/* * */

/** No selection leaves agencies unrestricted; selected organizations contribute their combined agencies. */
export function getLinesFilterAgencyIds(agencyIds: string[], organizations: OrganizationFilter[], selectedIds: string[]): string[] {
	if (!selectedIds.length) return agencyIds;

	const organizationIds = new Set(selectedIds);
	const organizationAgencyIds = new Set(organizations
		.filter(organization => organization.organization_type !== 'agency' && organization.organization_type !== 'other' && organizationIds.has(organization._id))
		.flatMap(organization => organization.agency_ids));

	return agencyIds.filter(agencyId => organizationAgencyIds.has(agencyId));
}
