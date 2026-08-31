'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsDetailUpdateNameModal } from '../StopsDetailUpdateName.modal';
import { useStopsDetailUpdateNameFormContext } from '../StopsDetailUpdateNameForm.context';

/* * */

export function StopsDetailUpdateNameModalHeader() {
	//

	//
	// A. Setup variables

	const { actions, form, status, unblock } = useStopsDetailUpdateNameFormContext();

	//
	// D. Handle actions

	const handleClose = () => {
		form.reset();
		unblock();
		closeStopsDetailUpdateNameModal();
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Label size="lg" singleLine>Alterar nome da paragem</Label>
			<Spacer />
			<Button
				label="Alterar nome"
				loading={status.isUpdating}
				onClick={actions.update}
			/>
		</Toolbar>
	);
}
