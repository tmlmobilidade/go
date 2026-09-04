'use client';

import { ReferencesEditorLines } from '../../lines/ReferencesEditorLines';
import { ReferencesEditorRides } from '../../rides/ReferencesEditorRides';
import { useReferencesEditorContext } from '../../shared/ReferencesEditor.context';
import { ReferencesEditorAgency } from '../../shared/ReferencesEditorAgency';
import { ReferencesEditorControls } from '../../shared/ReferencesEditorControls';
import { ReferencesEditorStops } from '../../stops/ReferencesEditorStops';

/* * */

export function ReferencesEditorMain() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<>

			<ReferencesEditorControls />

			{referencesEditorContext.data.selected_reference_type === 'agency' && <ReferencesEditorAgency />}
			{referencesEditorContext.data.selected_reference_type === 'lines' && <ReferencesEditorLines />}
			{referencesEditorContext.data.selected_reference_type === 'stops' && <ReferencesEditorStops />}
			{referencesEditorContext.data.selected_reference_type === 'rides' && <ReferencesEditorRides />}

		</>
	);
}
