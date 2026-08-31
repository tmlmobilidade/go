'use client';

import { Button, CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

import { closeStopsDetailEditCoordinatesModal } from '../StopsDetailEditCoordinates.modal';
import { useStopsDetailEditCoordinatesFormContext } from '../StopsDetailEditCoordinatesForm.context';

/* * */

export function StopsDetailEditCoordinatesModalHeader() {
	//

	//
	// A. Setup variables

	const { actions, status } = useStopsDetailEditCoordinatesFormContext();

	//
	// D. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeStopsDetailEditCoordinatesModal} type="close" />
			<Label size="md" caps singleLine>Alterar coordenadas da paragem</Label>
			<Spacer />
			<Button
				label="Alterar coordenadas"
				loading={status.isLoading}
				onClick={actions.updateCoordinates}
			/>
		</Toolbar>
	);
}
