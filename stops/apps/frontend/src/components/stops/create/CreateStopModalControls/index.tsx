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
		<Section>
			<Grid columns="ab" gap="md">
				<Button
					disabled={stopCreateContext.flags.loading}
					label="Cancelar"
					onClick={onClose}
					variant="danger"
				/>
				<Button
					label="Próximo passo"
					loading={stopCreateContext.flags.loading}
					// onClick={stopCreateContext.modal.advance}
				/>
			</Grid>
		</Section>
	);

	//
}
