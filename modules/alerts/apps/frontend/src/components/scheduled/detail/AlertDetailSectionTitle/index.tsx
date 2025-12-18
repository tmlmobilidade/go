'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconLink } from '@tabler/icons-react';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionTitle() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.detail.sectionTitle' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="md">
				<TextInput
					description={t('fields.title_description')}
					label={t('fields.title_label')}
					maxLength={255}
					placeholder={t('fields.title_placeholder')}
					withAsterisk
					{...alertDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					description={t('fields.description_description')}
					label={t('fields.description_label')}
					maxRows={10}
					minRows={4}
					placeholder={t('fields.description_placeholder')}
					autosize
					withAsterisk
					{...alertDetailContext.data.form.getInputProps('description')}
				/>
				<UploadImage
					imageUrl={alertDetailContext.data.imageUrl?.url}
					label={t('fields.image_label')}
					onDelete={alertDetailContext.actions.deleteImage}
					onFileChange={alertDetailContext.actions.fileChanged}
				/>
				<CoordinatesInput
					description={t('fields.coordinates_description')}
					{...alertDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					description={t('fields.link_description')}
					label={t('fields.link_label')}
					leftSection={<IconLink size={18} />}
					placeholder={t('fields.link_placeholder')}
					{...alertDetailContext.data.form.getInputProps('link')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
