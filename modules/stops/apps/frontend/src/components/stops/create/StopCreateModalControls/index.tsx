'use client';

/* * */

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { closeCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { Button, Grid, Section } from '@tmlmobilidade/ui';

/* * */

export function StopCreateModalControls() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="ab" gap="md">
				<Button
					disabled={stopCreateContext.flags.isSaving || stopCreateContext.modal.current_step === 1}
					label="Voltar"
					loading={stopCreateContext.flags.isSaving}
					onClick={stopCreateContext.modal.previousStep}
				/>
				<Button
					disabled={!stopCreateContext.modal.current_step_valid}
					label={stopCreateContext.modal.current_step === 3 ? 'Criar Paragem' : 'Próximo Passo'}
					loading={stopCreateContext.flags.isSaving}
					onClick={stopCreateContext.modal.current_step === 3 ? stopCreateContext.actions.createNewStop : stopCreateContext.modal.nextStep}
				/>
			</Grid>
			<Grid columns="a" gap="md">
				<Button
					disabled={stopCreateContext.flags.isSaving}
					label="Cancelar"
					onClick={closeCreateStopModal}
					variant="danger"
				/>
			</Grid>
		</Section>
	);

	//
}
