import { type Agency, type Organization } from '@tmlmobilidade/go-types-core';

export function getOrganizationCacheKey<Resource extends string>(organizationId: string, resource: Resource): `hub:v1:${string}:${Resource}` {
	return `hub:v1:${organizationId}:${resource}`;
}

export function getOrganizationGtfsResourceId(organizationId: string): string {
	return `gtfs-latest-${organizationId}`;
}

export function getOrganizationAgencyIds(organization: Organization, agencies: Agency[], service?: keyof Agency['open_data']['services']): string[] {
	return agencies
		.filter(agency => organization.agency_ids.includes(agency._id) && (!service || agency.open_data?.services?.[service]))
		.map(agency => agency._id);
}
