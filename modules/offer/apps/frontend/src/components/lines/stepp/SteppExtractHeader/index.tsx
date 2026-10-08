'use client';

import { closeSteppExtractsModal } from '@/components/lines/stepp/SteppExtract.modal';
import { CloseButton, Label, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function SteppExtractHeader() {
	//

	//
	// A. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeSteppExtractsModal} type="close" />
			<Label size="lg" singleLine>Exportar GTFS STePP</Label>
			<Spacer />
		</Toolbar>
	);
}
