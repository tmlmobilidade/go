'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { Button, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function StopCreateModalControls() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const { t } = useTranslation('stops', { keyPrefix: 'create.controls' });

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={stopCreateContext.flags.isSaving || stopCreateContext.modal.current_step === 1}
					label={t('back')}
					loading={stopCreateContext.flags.isSaving}
					onClick={stopCreateContext.modal.previousStep}
				/>
				<Button
					disabled={!stopCreateContext.modal.current_step_valid}
					label={stopCreateContext.modal.current_step === 3 ? t('create') : t('next')}
					loading={stopCreateContext.flags.isSaving}
					onClick={stopCreateContext.modal.current_step === 3 ? stopCreateContext.actions.createNewStop : stopCreateContext.modal.nextStep}
				/>
			</Grid>
		</Section>
	);

	//
}
