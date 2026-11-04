import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetAnnotationsPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing annotation, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Annotation['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Annotation['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for annotation forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original annotation or assign agencies
 * the user cannot manage.
 * @example
 * // Moving an annotation from agency A to B requires update access to A and B.
 * getAnnotationsPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getAnnotationsPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetAnnotationsPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Annotation['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.annotations.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.annotations.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.annotations.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.annotations.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.annotations.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.annotations.actions.update, selectedAgencyIds),
	};
}
