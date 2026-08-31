'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { Button, Grid, Section } from '@tmlmobilidade/ui';

import { closeStopCreateModal } from '../StopCreate.modal';

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
					disabled={stopCreateContext.flags.isCreating}
					label={stopCreateContext.form.multi_step.progress.current?.order === 0 ? 'Cancelar' : 'Voltar'}
					onClick={stopCreateContext.form.multi_step.progress.current?.order === 0 ? closeStopCreateModal : stopCreateContext.form.multi_step.actions.prev}
				/>
				<Button
					disabled={!stopCreateContext.form.multi_step.progress.current?.isValid}
					label={stopCreateContext.form.multi_step.progress.current?.order === stopCreateContext.form.multi_step.length - 1 ? 'Criar Paragem' : 'Avançar'}
					loading={stopCreateContext.flags.isCreating}
					onClick={stopCreateContext.form.multi_step.progress.current?.order === stopCreateContext.form.multi_step.length - 1 ? stopCreateContext.actions.create : stopCreateContext.form.multi_step.actions.next}
				/>
			</Grid>
		</Section>
	);

	//
}
