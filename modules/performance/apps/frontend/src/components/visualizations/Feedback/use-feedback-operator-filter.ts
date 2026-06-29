/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PublicFeedback } from '@tmlmobilidade/types';
import { useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

import { getOperatorName, sortOperatorsByCode } from './feedback-home/utils/operators';
import { type FeedbackEntityType } from './feedback-metrics';

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

	const filteredRows = useMemo(() => {
		if (!rows?.length || !selectedAgencyIds.length) return rows ?? [];

		const selectedAgencyIdsSet = new Set(selectedAgencyIds);
		return rows.filter(row => selectedAgencyIdsSet.has(row.agency_id));
	}, [rows, selectedAgencyIds]);

	const operatorOptions = useMemo(() => {
		const agencyIdsWithFeedback = new Set(
			(rows ?? [])
				.filter(row => row.entity_type === entityType)
				.map(row => row.agency_id),
		);

		return sortOperatorsByCode(operatorsData)
			.filter(operator => agencyIdsWithFeedback.has(operator._id))
			.map(operator => ({
				checked: selectedAgencyIds.includes(operator._id),
				label: `${operator._id} - ${getOperatorName(operator)}`,
				value: operator._id,
			}));
	}, [entityType, operatorsData, rows, selectedAgencyIds]);

	//
	// D. Return value

	return {
		isActive: selectedAgencyIds.length > 0,
		onChange: setSelectedAgencyIds,
		options: operatorOptions,
		rows: filteredRows,
	};
}
