import { type Event } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetEventsPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing event, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: Event['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: Event['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for event forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original event or assign agencies
 * the user cannot manage.
 * @example
 * // Moving an event from agency A to B requires update access to A and B.
 * getEventsPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getEventsPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetEventsPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: Event['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.events.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.events.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.events.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.events.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.events.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.events.actions.update, selectedAgencyIds),
	};
}
