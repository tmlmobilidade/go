'use client';

/* * */

import { UploadImage } from '@/components/common/UploadImage';
import { useAlertDetailContext } from '@/components/scheduled/detail/AlertDetail.context';
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
					key={alertDetailContext.data.form.key('title')}
					description={t('fields.titleDescription')}
					label={t('fields.titleLabel')}
					maxLength={255}
					placeholder={t('fields.titlePlaceholder')}
					withAsterisk
					{...alertDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={alertDetailContext.data.form.key('description')}
					description={t('fields.descriptionDescription')}
					label={t('fields.descriptionLabel')}
					maxRows={10}
					minRows={4}
					placeholder={t('fields.descriptionPlaceholder')}
					autosize
					withAsterisk
					{...alertDetailContext.data.form.getInputProps('description')}
				/>
				<UploadImage
					imageUrl={alertDetailContext.data.imageUrl?.url}
					label={t('fields.imageLabel')}
					onDelete={alertDetailContext.actions.deleteImage}
					onFileChange={alertDetailContext.actions.fileChanged}
				/>
				<CoordinatesInput
					key={alertDetailContext.data.form.key('coordinates')}
					description={t('fields.coordinatesDescription')}
					value={alertDetailContext.data.form.values.coordinates}
					{...alertDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					key={alertDetailContext.data.form.key('link')}
					description={t('fields.linkDescription')}
					label={t('fields.linkLabel')}
					leftSection={<IconLink size={18} />}
					placeholder={t('fields.linkPlaceholder')}
					{...alertDetailContext.data.form.getInputProps('link')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
