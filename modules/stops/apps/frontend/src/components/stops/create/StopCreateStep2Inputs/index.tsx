'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { Divider, Grid, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateStep2Inputs() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<>

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						key={stopCreateContext.data.form.key('name')}
						description={t('stops:stops.create.StopCreateStep2Inputs.fields.full_name.description')}
						label={t('stops:stops.create.StopCreateStep2Inputs.fields.full_name.label')}
						data-autofocus
						required
						{...stopCreateContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						defaultValue={stopCreateContext.data.form.values.short_name}
						description={t('stops:stops.create.StopCreateStep2Inputs.fields.short_name.description')}
						label={t('stops:stops.create.StopCreateStep2Inputs.fields.short_name.label')}
						readOnly
					/>
					<TextInput
						defaultValue={stopCreateContext.data.form.values.tts_name}
						description={t('stops:stops.create.StopCreateStep2Inputs.fields.tts_name.description')}
						label={t('stops:stops.create.StopCreateStep2Inputs.fields.tts_name.label')}
						readOnly
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
