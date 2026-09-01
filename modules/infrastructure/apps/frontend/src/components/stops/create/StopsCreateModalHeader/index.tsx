'use client';

import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsCreateModal } from '../StopsCreate.modal';
import { useStopsCreateFormStepsContext } from '../StopsCreateFormSteps.context';

/* * */

export function StopsCreateModalHeader() {
	//

	//
	// A. Setup variables

	const { progress } = useStopsCreateFormStepsContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeStopsCreateModal} type="close" />
			<Label size="lg" singleLine>Nova paragem</Label>
			<Spacer />
			<Label size="md" caps singleLine>Passo {progress.current?.order + 1} de {progress.steps.length}</Label>
		</Toolbar>
	);
}
