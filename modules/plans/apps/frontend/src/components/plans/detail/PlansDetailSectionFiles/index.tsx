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

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_files' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>

			<Section gap="sm">
				{planDetailContext.data.operation_file ? (
					<FileComponent file={planDetailContext.data.operation_file} />
				) : (
					<Label>{t('no_file_selected')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
