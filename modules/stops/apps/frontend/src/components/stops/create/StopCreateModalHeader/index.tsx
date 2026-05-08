'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { closeCreateStopModal } from '@/components/stops/create/StopCreate.modal';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function StopCreateModalHeader() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateStopModal} type="close" />
			<Label size="lg" singleLine>Nova paragem</Label>
			<Spacer />
			<Label size="md" caps singleLine>Passo {stopCreateContext.modal.current_step} de 3</Label>
		</Toolbar>
	);

	//
}
