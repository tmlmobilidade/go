/* * */

import type { FeedbackEntityType } from '@/utils/metrics/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

import { useFeedbackOperatorFilterContext } from '@/contexts/FeedbackOperatorFilter.context';
import { getOperatorName, sortOperatorsByCode } from '@/utils/feedback/operators';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function useFeedbackOperatorFilter(rows: PublicFeedback[] | undefined, entityType: 'all' | FeedbackEntityType) {
	//
	// A. Setup variables

	const { selectedAgencyIds, setSelectedAgencyIds } = useFeedbackOperatorFilterContext();

	//
	// B. Fetch data

	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Transform data

	const selectedAgencyIdsSet = useMemo(() => new Set(selectedAgencyIds), [selectedAgencyIds]);
	const operatorsById = useMemo(() => new Map((operatorsData ?? []).map(operator => [operator._id, operator])), [operatorsData]);

	const filteredRows = useMemo(() => {
		if (!rows) return [];
		if (selectedAgencyIdsSet.size === 0) return rows;

		return rows.filter(row => selectedAgencyIdsSet.has(row.agency_id));
	}, [rows, selectedAgencyIdsSet]);

	const operatorOptions = useMemo(() => {
		const agencyIdsWithFeedback = new Set(
			(rows ?? [])
				.filter(row => entityType === 'all' || row.entity_type === entityType)
				.map(row => row.agency_id),
		);

		return sortOperatorsByCode(operatorsData)
			.filter(operator => agencyIdsWithFeedback.has(operator._id) || selectedAgencyIdsSet.has(operator._id))
			.map(operator => ({
				checked: selectedAgencyIdsSet.has(operator._id),
				label: `${operator._id} - ${getOperatorName(operator)}`,
				value: operator._id,
			}));
	}, [entityType, operatorsData, rows, selectedAgencyIdsSet]);

	//
	// D. Return value

	return {
		isActive: selectedAgencyIdsSet.size > 0,
		onChange: setSelectedAgencyIds,
		operatorsById,
		options: operatorOptions,
		rows: filteredRows,
	};
}
