'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureStopsV1ExtractionCreate } from '@tmlmobilidade/go-types-extractions';
import { Button, fetchApiData, Pane, Section, useExtractionsListData, useHandleAction } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsExtractHeader } from '../StopsExtractHeader';

/* * */

export function StopsExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { mutate } = useExtractionsListData();

	//
	// B. Handle actions

	const { action: handleExtract } = useHandleAction({
		fetchFn: async () => await fetchApiData<Extraction[], InfrastructureStopsV1ExtractionCreate>({
			body: {
				properties: {
					municipality_ids: [],
				},
				send_email_notification: false,
				version: 'infrastructure-stops-v1',
			},
			method: 'POST',
			url: API_ROUTES.core.EXTRACTIONS_CREATE,
		}),
		onSuccess: (response) => {
			mutate(response);
		},
	});

	//
	// C. Render components

	return (
		<Pane header={[<StopsExtractHeader key="header" />]}>
			<Section>
				<Button label={t('default:stops.extract.ExtractButton.label')} onClick={handleExtract} />
			</Section>
		</Pane>
	);
}
