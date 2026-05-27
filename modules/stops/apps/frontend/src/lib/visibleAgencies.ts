import { Agency, HasPermissionResourceArgs, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

type HasPermissionResource = (args: Omit<HasPermissionResourceArgs, 'permissions'> | Omit<HasPermissionResourceArgs, 'permissions'>[]) => boolean;

export function getVisibleAgencyIds(agencies: Agency[], hasPermissionResource: HasPermissionResource): string[] {
	return agencies
		.filter(item => hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.read,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: item._id,
		}))
		.map(item => item._id);
}
