'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Extraction } from '@tmlmobilidade/go-types-extractions';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface ExtractionsListActionDownloadProps {
	extractionItem: Extraction
}

/* * */

export function ExtractionsListActionDownload({ extractionItem }: ExtractionsListActionDownloadProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Handle actions

	const handleDownload = () => {
		window.open(API_ROUTES.core.EXTRACTIONS_DOWNLOAD(extractionItem._id), '_blank');
	};

	//
	// C. Render components

	if (extractionItem.processing_status !== 'complete') {
		<Label singleLine>{t(`shared:extractions.versions.${extractionItem.version}.title`)}</Label>;
	}

	return (
		<>
			<Label singleLine>{t(`shared:extractions.versions.${extractionItem.version}.title`)}</Label>
			<Spacer />
			<Button label={t('shared:extractions.components.ExtractionsListActionDownload.button.label')} onClick={handleDownload} />
		</>
	);
}
