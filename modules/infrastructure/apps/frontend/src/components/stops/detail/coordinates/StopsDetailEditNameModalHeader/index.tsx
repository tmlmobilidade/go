'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsDetailEditNameModal } from '../StopsDetailEditName.modal';
import { useStopsDetailEditNameFormContext } from '../StopsDetailEditNameForm.context';

/* * */

export function StopsDetailEditNameModalHeader() {
	//

	//
	// A. Setup variables

	const { actions, status } = useStopsDetailEditNameFormContext();

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeStopsDetailEditNameModal} type="close" />
			<Label size="md" caps singleLine>Alterar nome da paragem</Label>
			<Spacer />
			<Button
				label="Alterar nome"
				loading={status.isLoading}
				onClick={actions.updateName}
			/>
		</Toolbar>
	);
}
