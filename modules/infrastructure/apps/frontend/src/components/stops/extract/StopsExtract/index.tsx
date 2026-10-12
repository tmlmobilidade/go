'use client';

import { InfrastructureStopsV1ExtractionCreateSchema, InfrastructureStopsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { useTranslation } from 'react-i18next';

import { StopsExtractForm } from '../shared/StopsExtractForm';
import { closeStopsExtractModal } from '../StopsExtract.modal';

/* * */

export function StopsExtract() {
	const { t } = useTranslation();

	return (
		<StopsExtractForm
			onClose={closeStopsExtractModal}
			schema={InfrastructureStopsV1ExtractionCreateSchema}
			title={t('default:stops.extract.Header.title')}
			versions={[
				{ label: t('shared:extractions.versions.infrastructure-stops-v1.title'), value: InfrastructureStopsV1ExtractionVersionValue },
			]}
		/>
	);
}
