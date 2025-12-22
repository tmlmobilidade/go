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
					description={t('fields.title_description')}
					label={t('fields.title_label')}
					maxLength={255}
					placeholder={t('fields.title_placeholder')}
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('title')}
				/>
				<Textarea
					description={t('fields.description_description')}
					label={t('fields.description_label')}
					maxRows={10}
					minRows={4}
					placeholder={t('fields.description_placeholder')}
					autosize
					withAsterisk
					{...realtimeDetailContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					description={t('fields.coordinates_description')}
					{...realtimeDetailContext.data.form.getInputProps('coordinates')}
				/>
				<TextInput
					description={t('fields.link_description')}
					label={t('fields.link_label')}
					leftSection={<IconLink size={18} />}
					placeholder={t('fields.link_placeholder')}
					{...realtimeDetailContext.data.form.getInputProps('link')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
