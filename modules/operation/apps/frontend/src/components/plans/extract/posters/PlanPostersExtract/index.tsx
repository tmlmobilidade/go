'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type OperationPostersV1ExtractionCreate } from '@tmlmobilidade/go-types-extractions';
import { Button, fetchApiData, Pane, Section, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';

import { PlanPostersExtractBody } from '../PlanPostersExtractBody';
import { PlanPostersExtractHeader } from '../PlanPostersExtractHeader';

/* * */

export function PlanPostersExtract() {
	//

	//
	// A. Setup variables

	const { mutate } = useExtractionsListData();

	const { action: handleExtract } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], OperationPostersV1ExtractionCreate>({
			body: {
				properties: {
					agency_ids: [],
					plan_ids: [],
				},
				send_email_notification: false,
				version: 'operation-posters-v1',
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
		},
	});

	//
	// B. Render components

	return (
		<Pane header={[<PlanPostersExtractHeader key="header" />]}>
			<PlanPostersExtractBody />
			<Section>
				<Button label="Extrair PDFs" onClick={handleExtract} />
			</Section>
		</Pane>
	);
}
