'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction, type InfrastructureNodesV1ExtractionCreate, type InfrastructureStopsV1ExtractionCreate } from '@tmlmobilidade/go-types-extractions';
import { hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, fetchApiData, Pane, Section, useExtractionsListData, useHandleAction, useMeData } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { StopsExtractHeader } from '../StopsExtractHeader';

/* * */

type StopsExtractionCreate = InfrastructureNodesV1ExtractionCreate | InfrastructureStopsV1ExtractionCreate;

export function StopsExtract() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { mutate } = useExtractionsListData();
	const { data: meData } = useMeData();

	//
	// B. Handle actions

	const { action: handleExtract, isLoading } = useHandleAction({
		fetchFn: async (version: StopsExtractionCreate['version']) => await fetchApiData<Extraction[], StopsExtractionCreate>({
			body: {
				properties: {
					municipality_ids: [],
				},
				send_email_notification: false,
				version,
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
			{hasPermission(meData?.permissions, { action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope }) && (
				<Section gap="sm">
					<Button disabled={isLoading} label={t('default:stops.extract.ExtractButton.label')} onClick={() => handleExtract('infrastructure-stops-v1')} />
					<Button disabled={isLoading} label={t('default:stops.extract.ExtractNodesButton.label')} onClick={() => handleExtract('infrastructure-nodes-v1')} />
				</Section>
			)}
		</Pane>
	);
}
