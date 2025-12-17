'use client';

/* * */

import { FileComponent } from '@/components/common/FileComponent';
import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailSectionFiles() {
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
				{plansDetailContext.data.operation_file ? (
					<FileComponent file={plansDetailContext.data.operation_file} />
				) : (
					<Label>{t('no_file_selected')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
