'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { CreateAlertSchema } from '@tmlmobilidade/types';
import { Collapsible, CoordinatesInput, Section, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateSectionTitle() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.sectionTitle' });
	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="md">
				<TextInput
					key={alertCreateContext.data.form.key('title')}
					description={t('fields.title_description')}
					label={t('fields.title_label')}
					maxLength={255}
					placeholder={t('fields.title_placeholder')}
					withAsterisk
					{...alertCreateContext.data.form.getInputProps('title')}
				/>
				<Textarea
					key={alertCreateContext.data.form.key('description')}
					description={t('fields.description_description')}
					label={t('fields.description_label')}
					maxRows={10}
					minRows={4}
					placeholder={t('fields.description_placeholder')}
					withAsterisk={!CreateAlertSchema.shape.description.isOptional()}
					autosize
					{...alertCreateContext.data.form.getInputProps('description')}
				/>
				<CoordinatesInput
					key={alertCreateContext.data.form.key('coordinates')}
					description={t('fields.coordinates_description')}
					{...alertCreateContext.data.form.getInputProps('coordinates')}
				/>
			</Section>
		</Collapsible>
	);

	//
}
