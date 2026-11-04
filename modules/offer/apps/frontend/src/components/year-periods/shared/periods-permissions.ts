import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

interface GetPeriodsPermissionsArgs {
	/**
	 * Agency IDs persisted on the existing period, before any form edits.
	 * Used to authorize editing, locking and deletion. Omit when creating.
	 */
	currentAgencyIds?: YearPeriod['agency_ids']

	/**
	 * Agency IDs currently selected in the form, including unsaved changes.
	 * Used to authorize creation and the proposed agency assignment on update.
	 */
	selectedAgencyIds: YearPeriod['agency_ids']

	/** Permissions of the authenticated user. Missing permissions deny access. */
	userPermissions?: Permission[]
}

/* * */

/**
 * Derives agency-scoped permissions for period forms.
 * Editing, locking and deletion use the persisted agencies; creating uses the
 * selected agencies, and updating requires access to both sets so changing the
 * selection cannot bypass access to the original period or assign agencies
 * the user cannot manage.
 * @example
 * // Moving a period from agency A to B requires update access to A and B.
 * getPeriodsPermissions({
 *   currentAgencyIds: ['A'],
 *   selectedAgencyIds: ['B'],
 *   userPermissions,
 * });
 */
export function getPeriodsPermissions({ currentAgencyIds = [], selectedAgencyIds, userPermissions = [] }: GetPeriodsPermissionsArgs) {
	const hasAgencyPermission = (action: string, agencyIds: YearPeriod['agency_ids']) => PermissionCatalog.hasPermissionResourceAll({
		action,
		permissions: userPermissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: agencyIds,
	});

	const edit = hasAgencyPermission(PermissionCatalog.all.year_periods.actions.update, currentAgencyIds);

	return {
		create: hasAgencyPermission(PermissionCatalog.all.year_periods.actions.create, selectedAgencyIds),
		delete: hasAgencyPermission(PermissionCatalog.all.year_periods.actions.delete, currentAgencyIds),
		edit,
		lock: hasAgencyPermission(PermissionCatalog.all.year_periods.actions.lock, currentAgencyIds),
		update: edit && hasAgencyPermission(PermissionCatalog.all.year_periods.actions.update, selectedAgencyIds),
	};
}
