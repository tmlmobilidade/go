/* * */

import { locationPermissionMatch } from '@tmlmobilidade/go-interfaces-locationsdb';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Restricts the all-stops export to locations the requesting user can read.
 * Missing location permissions match no stops.
 */
export function getStopsLocationFilter(permissions: Permission[]) {
	const access = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: PermissionCatalog.all.stops.actions.read, scope: PermissionCatalog.all.stops.scope }],
		permissions,
		resource_key: 'location_ids',
	});

	return access.allowAll ? {} : locationPermissionMatch(access.values);
}
