import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetHolidaysPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing holiday, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Holiday['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Holiday['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for holiday forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original holiday or assign agencies
 * the user cannot manage.
 * @example
 * // Moving a holiday from agency A to B requires update access to A and B.
 * getHolidaysPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getHolidaysPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetHolidaysPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Holiday['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.holidays.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.holidays.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.holidays.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.holidays.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.holidays.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.holidays.actions.update, selectedAgencyIds),
	};
}
