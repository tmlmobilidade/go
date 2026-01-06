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
	const { t } = useTranslation('plans');

	//
	// B. Render components

	return (
		<Collapsible
			description={t('validations.detail.SectionFeedInfo.description')}
			title={t('validations.detail.SectionFeedInfo.title')}
		>

			<Section gap="sm">
				<FeedInfoDisplay data={validationsDetailContext.data.validation?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				{validationsDetailContext.data.file ? (
					<FileComponent file={validationsDetailContext.data.file} />
				) : (
					<Label>{t('validations.detail.SectionFeedInfo.no_file_selected')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
