import { type Zone } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetZonesPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing zone, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Zone['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Zone['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for zone forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original zone or assign agencies
 * the user cannot manage.
 * @example
 * // Moving a zone from agency A to B requires update access to A and B.
 * getZonesPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getZonesPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetZonesPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Zone['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.zones.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.zones.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.zones.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.zones.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.zones.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.zones.actions.update, selectedAgencyIds),
	};
}
