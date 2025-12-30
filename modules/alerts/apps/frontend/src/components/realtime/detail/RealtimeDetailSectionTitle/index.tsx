'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconLink } from '@tabler/icons-react';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeDetailSectionTitle() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.detail.sectionTitle' });
	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
			defaultOpen
		>
			<Section gap="md">
				<TextInput
					description={t('fields.titleDescription')}
					label={t('fields.titleLabel')}
					maxLength={255}
					placeholder={t('fields.titlePlaceholder')}
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					description={t('fields.descriptionDescription')}
					label={t('fields.descriptionLabel')}
					maxRows={10}
					minRows={4}
					placeholder={t('fields.descriptionPlaceholder')}
					autosize
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					description={t('fields.coordinatesDescription')}
					{...realtimeDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					description={t('fields.linkDescription')}
					label={t('fields.linkLabel')}
					leftSection={<IconLink size={18} />}
					placeholder={t('fields.linkPlaceholder')}
					{...realtimeDetailContext.data.form.getInputProps('link')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
