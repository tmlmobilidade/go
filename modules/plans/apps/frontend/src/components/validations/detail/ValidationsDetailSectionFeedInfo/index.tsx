/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { FileComponent } from '@/components/common/FileComponent';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { Collapsible, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('plans:validations.detail.ValidationsDetailSectionFeedInfo.description')}
			title={t('plans:validations.detail.ValidationsDetailSectionFeedInfo.title')}
		>

			<Section gap="sm">
				<FeedInfoDisplay data={validationsDetailContext.data.validation?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				{validationsDetailContext.data.file ? (
					<FileComponent file={validationsDetailContext.data.file} />
				) : (
					<Label>{t('plans:validations.detail.ValidationsDetailSectionFeedInfo.empty_state.label')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
