'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function CreateStopModalHeader() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render Components

	return (
		<Toolbar>
			<Label size="lg" singleLine>Nova paragem</Label>
			<Spacer />
			<Label size="md" caps singleLine>Passo {stopCreateContext.modal.current_step + 1} de 3</Label>
		</Toolbar>
	);

	//
}
