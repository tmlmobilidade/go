'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsDetailEditNameModal } from '../StopsDetailEditName.modal';
import { useStopsDetailEditNameFormContext } from '../StopsDetailEditNameForm.context';

/* * */

export function StopsDetailEditNameModalHeader() {
	//

	//
	// A. Setup variables

	const { actions, form, status, unblock } = useStopsDetailEditNameFormContext();

	//
	// D. Handle actions

	const handleClose = () => {
		form.reset();
		unblock();
		closeStopsDetailEditNameModal();
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Label size="md" caps singleLine>Alterar nome da paragem</Label>
			<Spacer />
			<Button
				label="Alterar nome"
				loading={status.isUpdating}
				onClick={actions.update}
			/>
		</Toolbar>
	);
}
