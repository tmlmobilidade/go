/* * */

import type { FeedbackEntityType } from '@/utils/metrics/feedback-metrics';
import type { Permission, PublicFeedback } from '@tmlmobilidade/types';

import { useFeedbackOperatorFilterContext } from '@/contexts/feedback/FeedbackOperatorFilter.context';
import { getOperatorName, sortOperatorsByCode } from '@/utils/feedback/operators';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { useDataAgencies, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

type FeedbackOperatorFilterEntityType = 'all' | FeedbackEntityType;
type HasPermissionResource = ReturnType<typeof useMeContext>['actions']['hasPermissionResource'];

function hasAgencyPermission(entityType: FeedbackEntityType, agencyId: string, hasPermissionResource: HasPermissionResource) {
	if (entityType === 'line') {
		return hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.read,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: agencyId,
		});
	}

	return hasPermissionResource({
		action: PermissionCatalog.all.stops.actions.read,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.stops.scope,
		value: agencyId,
	});
}

function hasOperatorPermission(entityType: FeedbackOperatorFilterEntityType, agencyId: string, hasPermissionResource: HasPermissionResource) {
	if (entityType === 'all') {
		return hasAgencyPermission('line', agencyId, hasPermissionResource) || hasAgencyPermission('stop', agencyId, hasPermissionResource);
	}

	return hasAgencyPermission(entityType, agencyId, hasPermissionResource);
}

function hasConfiguredAgencyPermissions(entityType: FeedbackOperatorFilterEntityType, permissions: Permission[] = []) {
	const hasLineAgencyPermissions = PermissionCatalog.get(permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read)?.resources.agency_ids.length;
	const hasStopAgencyPermissions = PermissionCatalog.get(permissions, PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.read)?.resources.agency_ids.length;

	if (entityType === 'line') return Boolean(hasLineAgencyPermissions);
	if (entityType === 'stop') return Boolean(hasStopAgencyPermissions);
	return Boolean(hasLineAgencyPermissions || hasStopAgencyPermissions);
}

/* * */

export function useFeedbackOperatorFilter(rows: PublicFeedback[] | undefined, entityType: FeedbackOperatorFilterEntityType) {
	//
	// A. Setup variables

	const { selectedAgencyIds, setSelectedAgencyIds } = useFeedbackOperatorFilterContext();
	const meContext = useMeContext();

	//
	// B. Fetch data

	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Transform data

	const selectedAgencyIdsSet = useMemo(() => new Set(selectedAgencyIds), [selectedAgencyIds]);
	const operatorsById = useMemo(() => new Map((operatorsData ?? []).map(operator => [operator._id, operator])), [operatorsData]);
	const permittedAgencyIds = useMemo(() => {
		return new Set(
			(operatorsData ?? [])
				.filter(operator => hasOperatorPermission(entityType, operator._id, meContext.actions.hasPermissionResource))
				.map(operator => operator._id),
		);
	}, [entityType, meContext.actions.hasPermissionResource, operatorsData]);
	const hasPermissionScopedOperators = useMemo(() => {
		return hasConfiguredAgencyPermissions(entityType, meContext.data.user?.permissions);
	}, [entityType, meContext.data.user?.permissions]);
	const effectiveSelectedAgencyIdsSet = useMemo(() => {
		if (!hasPermissionScopedOperators) return selectedAgencyIdsSet;

		return new Set([...selectedAgencyIdsSet].filter(agencyId => permittedAgencyIds.has(agencyId)));
	}, [hasPermissionScopedOperators, permittedAgencyIds, selectedAgencyIdsSet]);

	const availableRows = useMemo(() => {
		if (!rows) return [];
		if (!hasPermissionScopedOperators) return rows;

		return rows.filter(row => hasAgencyPermission(row.entity_type, row.agency_id, meContext.actions.hasPermissionResource));
	}, [hasPermissionScopedOperators, meContext.actions.hasPermissionResource, rows]);

	const filteredRows = useMemo(() => {
		if (effectiveSelectedAgencyIdsSet.size === 0) return availableRows;

		return availableRows.filter(row => effectiveSelectedAgencyIdsSet.has(row.agency_id));
	}, [availableRows, effectiveSelectedAgencyIdsSet]);

	const operatorOptions = useMemo(() => {
		const agencyIdsWithFeedback = new Set(
			availableRows
				.filter(row => entityType === 'all' || row.entity_type === entityType)
				.map(row => row.agency_id),
		);

		return sortOperatorsByCode(operatorsData)
			.filter(operator => !hasPermissionScopedOperators || permittedAgencyIds.has(operator._id))
			.filter(operator => agencyIdsWithFeedback.has(operator._id) || effectiveSelectedAgencyIdsSet.has(operator._id))
			.map(operator => ({
				checked: effectiveSelectedAgencyIdsSet.has(operator._id),
				label: `${operator._id} - ${getOperatorName(operator)}`,
				value: operator._id,
			}));
	}, [availableRows, effectiveSelectedAgencyIdsSet, entityType, hasPermissionScopedOperators, operatorsData, permittedAgencyIds]);

	//
	// D. Return value

	return {
		availableRows,
		isActive: effectiveSelectedAgencyIdsSet.size > 0,
		onChange: setSelectedAgencyIds,
		operatorsById,
		options: operatorOptions,
		rows: filteredRows,
	};
}
