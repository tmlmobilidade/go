'use client';

import { DatesAnnotationsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { CloseButton, Divider, Label, Pane, Section, Select, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AnnotationsListExportFooter } from '../AnnotationsListExportFooter';
import { AnnotationsListExportProperties } from '../AnnotationsListExportProperties';
import { closeAnnotationsListExportModal } from './AnnotationsListExport.modal';

/* * */

export function AnnotationsListExport() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Pane header={[
			<Toolbar key="header">
				<CloseButton onClick={closeAnnotationsListExportModal} type="close" />
				<Label size="lg" singleLine>{t('annotations:list.AnnotationsListExport.title')}</Label>
			</Toolbar>,
		]}
		>
			<Section>
				<Select
					clearable={false}
					data={[{ label: t('shared:extractions.versions.dates-annotations-v1.title'), value: DatesAnnotationsV1ExtractionVersionValue }]}
					label={t('annotations:list.AnnotationsListExport.version')}
					value={DatesAnnotationsV1ExtractionVersionValue}
					readOnly
				/>
			</Section>
			<AnnotationsListExportProperties />
			<Divider />
			<AnnotationsListExportFooter />
		</Pane>
	);
}
