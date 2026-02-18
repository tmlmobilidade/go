/* * */

import { FeedInfoDisplay } from '@/components/common/FeedInfoDisplay';
import { FileComponent } from '@/components/common/FileComponent';
import { useValidationsDetailContext } from '@/contexts/ValidationsDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { useTranslation } from 'react-i18next';
import { Collapsible, Label, Section, useToast } from '@tmlmobilidade/ui';

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
			window.open(API_ROUTES.plans.VALIDATIONS_DETAIL_FILE_DOWNLOAD(validationsDetailContext.data.validation?._id), '_blank');
		}
		catch (error) {
			useToast.error({
				message: error instanceof Error ? error.message : 'Erro ao transferir ficheiro',
				title: 'Erro ao transferir ficheiro',
			});
		}
	};

	//
	// C. Render components

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
					<FileComponent
						fileData={validationsDetailContext.data.file}
						onClick={handleDownload}
					/>
				) : (
					<Label>{t('plans:validations.detail.ValidationsDetailSectionFeedInfo.empty_state.label')}</Label>
				)}
			</Section>

		</Collapsible>
	);

	//
}
