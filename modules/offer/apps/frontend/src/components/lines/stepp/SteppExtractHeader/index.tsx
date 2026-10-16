'use client';

import { closeSteppExtractsModal } from '@/components/lines/stepp/SteppExtract.modal';
import { useSteppExtractFormContext } from '@/components/lines/stepp/SteppExtractForm.context';
import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractHeader() {
	//

	//
	// A. Setup variables

	const { actions, capabilities, status } = useSteppExtractFormContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeSteppExtractsModal} type="close" />
			<Label size="lg" singleLine>Exportar GTFS STePP</Label>
			<Spacer />
			<Button
				disabled={!capabilities.createEnabled}
				label="Exportar"
				loading={status.isCreating}
				onClick={actions.create}
			/>
		</Toolbar>
	);
}
