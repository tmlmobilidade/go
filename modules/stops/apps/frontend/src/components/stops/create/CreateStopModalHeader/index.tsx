'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { Label, Spacer, Toolbar } from '@go/ui';

/* * */

export function CreateStopModalHeader() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" singleLine>Nova paragem</Label>
			<Spacer />
			<Label size="md" caps singleLine>Passo {stopCreateContext.modal.current_step} de 3</Label>
		</Toolbar>
	);

	//
}
