/* * */

import type { FeedbackEntityType } from '@/utils/feedback/feedback-metrics';
import type { PublicFeedback } from '@tmlmobilidade/types';

import { getOperatorName, sortOperatorsByCode } from '@/utils/feedback/operators';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

export function useFeedbackOperatorFilter(rows: PublicFeedback[] | undefined, entityType: FeedbackEntityType) {
	//
	// A. Setup variables

	const [selectedAgencyIds, setSelectedAgencyIds] = useState<string[]>([]);

	//
	// B. Fetch data

	const { raw: operatorsData } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// C. Transform data

	const selectedAgencyIdsSet = useMemo(() => new Set(selectedAgencyIds), [selectedAgencyIds]);

	const filteredRows = useMemo(() => {
		if (!rows) return [];
		if (selectedAgencyIdsSet.size === 0) return rows;

		return rows.filter(row => selectedAgencyIdsSet.has(row.agency_id));
	}, [rows, selectedAgencyIdsSet]);

	const operatorOptions = useMemo(() => {
		const agencyIdsWithFeedback = new Set(
			(rows ?? [])
				.filter(row => row.entity_type === entityType)
				.map(row => row.agency_id),
		);

		return sortOperatorsByCode(operatorsData)
			.filter(operator => agencyIdsWithFeedback.has(operator._id))
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
		options: operatorOptions,
		rows: filteredRows,
	};
}
