'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsDetailUpdateCoordinatesModal } from '../StopsDetailUpdateCoordinates.modal';
import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';

/* * */

export function StopsDetailUpdateCoordinatesModalHeader() {
	//

	//
	// A. Setup variables

	const { actions, form, status, unblock } = useStopsDetailUpdateCoordinatesFormContext();

	//
	// D. Handle actions

	const handleClose = () => {
		form.reset();
		unblock();
		closeStopsDetailUpdateCoordinatesModal();
	};

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} type="close" />
			<Label size="lg" singleLine>Alterar coordenadas da paragem</Label>
			<Spacer />
			<Button
				label="Alterar coordenadas"
				loading={status.isUpdating}
				onClick={actions.update}
			/>
		</Toolbar>
	);
}
