'use client';

import { InfrastructureNodesV1ExtractionCreateSchema, InfrastructureNodesV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { useTranslation } from 'react-i18next';

import { closeNodesExtractModal } from '../NodesExtract.modal';
import { StopsExtractForm } from '../shared/StopsExtractForm';

/* * */

export function NodesExtract() {
	const { t } = useTranslation();

	return (
		<StopsExtractForm
			onClose={closeNodesExtractModal}
			schema={InfrastructureNodesV1ExtractionCreateSchema}
			showFacilitiesAndConnections={false}
			title={t('default:stops.extract.NodesExtract.title')}
			versions={[
				{ label: t('shared:extractions.versions.infrastructure-nodes-v1.title'), value: InfrastructureNodesV1ExtractionVersionValue },
			]}
		/>
	);
}
