'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationRidesV1ExtractionCreate } from '@tmlmobilidade/go-types-extractions';
import { Button, fetchApiData, openExtractionsListModal, Section, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

import { useRidesListFilterAgency } from '../../../../list/filters/RidesListFilterAgency/use-rides-list-filter-agency';
import { useRidesListFilterDateRange } from '../../../../list/filters/RidesListFilterDateRange/use-rides-list-filter-date-range';
import { closeRidesExtractModal } from '../../../RidesExtract.modal';

/* * */

export function RidesExtractV1() {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

	const filterAgency = useRidesListFilterAgency();
	const filterDateRange = useRidesListFilterDateRange();

	//
	// B. Handle actions

	const { action: handleExtract, isLoading } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationRidesV1ExtractionCreate>({
			body: {
				properties: {
					agency_ids: filterAgency.value,
					start_time_scheduled_end: filterDateRange.value_end,
					start_time_scheduled_start: filterDateRange.value_start,
				},
				send_email_notification: false,
				version: 'operation-rides-v1',
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
			closeRidesExtractModal();
			openExtractionsListModal();
		},
	});

	//
	// C. Render components

	return (
		<Section>
			<Button
				label="Extract"
				loading={isLoading}
				onClick={handleExtract}
			/>
		</Section>
	);
}
