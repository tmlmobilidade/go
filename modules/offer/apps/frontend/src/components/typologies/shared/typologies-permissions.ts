import { type Typology } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetTypologiesPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing typology, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Typology['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Typology['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for typology forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original typology or assign agencies
 * the user cannot manage.
 * @example
 * // Moving a typology from agency A to B requires update access to A and B.
 * getTypologiesPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getTypologiesPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetTypologiesPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Typology['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.typologies.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.typologies.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.typologies.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.typologies.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.typologies.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.typologies.actions.update, selectedAgencyIds),
	};
}
