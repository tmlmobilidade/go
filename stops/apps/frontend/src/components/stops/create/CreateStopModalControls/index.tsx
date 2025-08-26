'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { Button, Grid, Section } from '@tmlmobilidade/ui';

/* * */

interface CreateStopModalControlsProps {
	onClose: () => void
}

/* * */

export function CreateStopModalControls({ onClose }: CreateStopModalControlsProps) {
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
					disabled={stopCreateContext.flags.loading || stopCreateContext.modal.current_step === 1}
					label="Voltar"
					loading={stopCreateContext.flags.loading}
					onClick={stopCreateContext.modal.previousStep}
				/>
				<Button
					disabled={!stopCreateContext.modal.current_step_valid}
					label={stopCreateContext.modal.current_step === 3 ? 'Criar Paragem' : 'Próximo Passo'}
					loading={stopCreateContext.flags.loading}
					onClick={stopCreateContext.modal.current_step === 3 ? stopCreateContext.actions.createNewStop : stopCreateContext.modal.nextStep}
				/>
			</Grid>
			<Grid columns="a" gap="md">
				<Button
					disabled={stopCreateContext.flags.loading}
					label="Cancelar"
					onClick={onClose}
					variant="danger"
				/>
			</Grid>
		</Section>
	);

	//
}
