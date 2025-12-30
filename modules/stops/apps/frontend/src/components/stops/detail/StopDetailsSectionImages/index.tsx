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

	const stopDetailContext = useStopDetailContext();
	const { t } = useTranslation('stops', { keyPrefix: 'detail.sections.images' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			{/* <Section>
				<UploadImage
					imageUrl={stopDetailContext.data.imageUrl}
					label={t('fields.imageLabel')}
					onDelete={stopDetailContext.actions.deleteImage}
					onFileChange={stopDetailContext.actions.fileChanged}
				/>
			</Section> */}
		</Collapsible>
	);

	//
}
