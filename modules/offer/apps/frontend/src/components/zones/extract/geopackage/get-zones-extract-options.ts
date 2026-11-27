import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

export function getZonesExportOptions(zones: Pick<Zone, '_id' | 'agency_ids' | 'name'>[], permissions: Permission[]) {
	//

	//
	// A. Filter zones by agency access

	const { allowAll, values } = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: 'export-geopackage', scope: 'zones' }],
		permissions,
		resource_key: 'agency_ids',
	});
	const agencyIds = new Set(values);

	//
	// B. Return the filtered zones

	return zones
		.filter(zone => zone.agency_ids?.some(id => id && (allowAll || agencyIds.has(id))))
		.map(zone => ({ label: zone.name, value: zone._id }));
}
