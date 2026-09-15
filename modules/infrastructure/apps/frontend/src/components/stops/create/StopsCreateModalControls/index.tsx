'use client';

import { Button, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { closeStopsCreateModal } from '../StopsCreate.modal';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';
import { useStopsCreateFormStepsContext } from '../StopsCreateFormSteps.context';

/* * */

export function StopsCreateModalControls() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { actions: stepsActions, progress } = useStopsCreateFormStepsContext();

	const { actions: formActions, status } = useStopsCreateFormContext();

	//
	// B. Setup flags

	const isFirstStep = progress.current?.order === 0;
	const isLastStep = progress.current?.order === progress.steps.length - 1;

	//
	// C. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={status.isCreating}
					label={isFirstStep ? t('default:stops.create.Controls.CancelButton.label') : t('default:stops.create.Controls.BackButton.label')}
					onClick={isFirstStep ? closeStopsCreateModal : stepsActions.prev}
				/>
				<Button
					disabled={!progress.current?.isValid}
					label={isLastStep ? t('default:stops.create.Controls.CreateButton.label') : t('default:stops.create.Controls.NextButton.label')}
					loading={status.isCreating}
					onClick={isLastStep ? formActions.create : stepsActions.next}
				/>
			</Grid>
		</Section>
	);
}
