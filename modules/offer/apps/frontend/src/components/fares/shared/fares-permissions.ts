import { type Fare } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetFaresPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing fare, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Fare['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Fare['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for fare forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original fare or assign agencies
 * the user cannot manage.
 * @example
 * // Moving a fare from agency A to B requires update access to A and B.
 * getFaresPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getFaresPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetFaresPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Fare['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.fares.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.fares.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.fares.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.fares.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.fares.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.fares.actions.update, selectedAgencyIds),
	};
}
