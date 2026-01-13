'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlanDetailContext } from '@/components/plans/detail/PlanDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionFiles() {
	//

	//
	// A. Setup variables

	const planDetailContext = usePlanDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('plans:plans.detail.PlansDetailSectionFiles.description')}
			title={t('plans:plans.detail.PlansDetailSectionFiles.title')}
		>

			<Section gap="sm">
				{planDetailContext.data.operation_file ? (
					<FileComponent file={planDetailContext.data.operation_file} />
				) : (
					<Label>{t('plans:plans.detail.PlansDetailSectionFiles.empty_state.label')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
