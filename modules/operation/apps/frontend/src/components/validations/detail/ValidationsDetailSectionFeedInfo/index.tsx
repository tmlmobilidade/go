'use client';

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { useValidationsDetailContext } from '@/components/validations/detail/ValidationsDetailForm.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Collapsible, FileItem, Label, Section, useToast } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ValidationsDetailSectionFeedInfo() {
	//

	//
	// A. Setup variables

	const validationsDetailContext = useValidationsDetailContext();
	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleDownload = async () => {
		try {
			// Open file.url in a new window
			window.open(API_ROUTES.operation.GTFS_VALIDATIONS_DETAIL_FILE_DOWNLOAD(validationsDetailContext.data.validation?._id), '_blank');
		} catch (error) {
			const errorTitle = t('validations:detail.ValidationsDetailSectionFeedInfo.download_error');
			useToast.error({
				message: error instanceof Error ? error.message : errorTitle,
				title: errorTitle,
			});
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description={t('validations:detail.ValidationsDetailSectionFeedInfo.description')}
			title={t('validations:detail.ValidationsDetailSectionFeedInfo.title')}
		>

			<Section gap="sm">
				<FeedInfoDisplay data={validationsDetailContext.data.validation?.gtfs_feed_info} />
			</Section>

			<Section gap="sm">
				{validationsDetailContext.data.file ? (
					<FileItem
						fileName={validationsDetailContext.data.file.name}
						fileType={validationsDetailContext.data.file.type}
						onDownload={handleDownload}
					/>
				) : (
					<Label>{t('validations:detail.ValidationsDetailSectionFeedInfo.no_file')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
