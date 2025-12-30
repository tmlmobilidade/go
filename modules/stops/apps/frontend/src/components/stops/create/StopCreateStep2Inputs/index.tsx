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

	const stopCreateContext = useStopCreateContext();
	const { t } = useTranslation('stops', { keyPrefix: 'create.step2.fields' });

	//
	// B. Render components

	return (
		<>

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						key={stopCreateContext.data.form.key('name')}
						description={t('fullName.description')}
						label={t('fullName.label')}
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
						description={t('shortName.description')}
						label={t('shortName.label')}
						readOnly
					/>
					<TextInput
						defaultValue={stopCreateContext.data.form.values.tts_name}
						description={t('ttsName.description')}
						label={t('ttsName.label')}
						readOnly
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
