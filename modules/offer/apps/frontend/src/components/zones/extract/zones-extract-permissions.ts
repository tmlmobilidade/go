import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

/** Uses the same agency access policy as the zones list endpoint and extractor. */
export function getZonesExtractAgencyAccess(permissions: Permission[] = []) {
	return PermissionCatalog.getPermissionResourceAccess({
		checks: [
			{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.zones.actions.nav, scope: PermissionCatalog.all.zones.scope },
		],
		permissions,
		resource_key: 'agency_ids',
	});
}
