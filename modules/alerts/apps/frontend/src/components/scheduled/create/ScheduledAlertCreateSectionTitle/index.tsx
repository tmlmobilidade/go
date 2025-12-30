'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { CreateAlertSchema } from '@tmlmobilidade/types';
import { Section, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ScheduledAlertCreateSectionTitle() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.sectionTitle' });

	//
	// B. Render components

	return (
		<Section gap="md">
			<TextInput
				key={scheduledAlertCreateContext.data.form.key('title')}
				description={t('fields.titleDescription')}
				label={t('fields.titleLabel')}
				maxLength={255}
				data-autofocus
				withAsterisk
				{...scheduledAlertCreateContext.data.form.getInputProps('title')}
			/>
			<Textarea
				key={scheduledAlertCreateContext.data.form.key('description')}
				description={t('fields.descriptionDescription')}
				label={t('fields.descriptionLabel')}
				maxRows={10}
				minRows={4}
				withAsterisk={!CreateAlertSchema.shape.description.isOptional()}
				autosize
				{...scheduledAlertCreateContext.data.form.getInputProps('description')}
			/>
		</Section>
	);

	//
}
