'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';

import { closeRidesExtractModal } from '../RidesExtract.modal';

/* * */

export function RidesExtractHeader() {
	return (
		<Toolbar>
			<CloseButton onClick={closeRidesExtractModal} type="close" />
			<Label size="lg" singleLine>Exportar circulações</Label>
		</Toolbar>
	);
}
