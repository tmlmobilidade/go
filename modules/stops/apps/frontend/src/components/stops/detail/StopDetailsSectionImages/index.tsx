'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopDetailsSectionImages() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('stops');
	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('stops.detail.SectionImages.description')}
			title={t('stops.detail.SectionImages.title')}
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
