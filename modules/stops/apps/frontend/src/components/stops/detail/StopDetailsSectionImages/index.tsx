'use client';

/* * */

import { Collapsible } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionImages() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('stops:stops.detail.StopDetailsSectionImages.description')}
			title={t('stops:stops.detail.StopDetailsSectionImages.title')}
		>
			{/* <Section>
				<UploadImage
					imageUrl={stopDetailContext.data.imageUrl}
					label={t('stops.detail.SectionImages.fields.image_label')}
					onDelete={stopDetailContext.actions.deleteImage}
					onFileChange={stopDetailContext.actions.fileChanged}
				/>
			</Section> */}
		</Collapsible>
	);

	//
}
