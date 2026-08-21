'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { closeStopCreateModal } from '@/components/stops/create/StopCreate.modal';
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
			<CloseButton onClick={closeStopCreateModal} type="close" />
			<Label size="lg" singleLine>Nova paragem</Label>
			<Spacer />
			<Label size="md" caps singleLine>Passo {stopCreateContext.form.multi_step.progress.current?.order + 1} de {stopCreateContext.form.multi_step.length}</Label>
		</Toolbar>
	);

	//
}
