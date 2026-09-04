'use client';

import { Button, Grid, Section } from '@tmlmobilidade/ui';

import { closeStopsCreateModal } from '../StopsCreate.modal';
import { useStopsCreateFormContext } from '../StopsCreateForm.context';
import { useStopsCreateFormStepsContext } from '../StopsCreateFormSteps.context';

/* * */

export function StopsCreateModalControls() {
	//

	//
	// A. Setup variables

	const { actions: stepsActions, progress } = useStopsCreateFormStepsContext();

	const { actions: formActions, status } = useStopsCreateFormContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={status.isCreating}
					label={progress.current?.order === 0 ? 'Cancelar' : 'Voltar'}
					onClick={progress.current?.order === 0 ? closeStopsCreateModal : stepsActions.prev}
				/>
				<Button
					disabled={!progress.current?.isValid}
					label={progress.current?.order === progress.steps.length - 1 ? 'Criar Paragem' : 'Avançar'}
					loading={status.isCreating}
					onClick={progress.current?.order === progress.steps.length - 1 ? formActions.create : stepsActions.next}
				/>
			</Grid>
		</Section>
	);
}
