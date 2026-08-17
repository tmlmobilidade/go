'use client';

import { ReferencesEditorLines } from '@/components/references/lines/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/references/rides/ReferencesEditorRides';
import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { ReferencesEditorAgency } from '@/components/references/shared/ReferencesEditorAgency';
import { ReferencesEditorControls } from '@/components/references/shared/ReferencesEditorControls';
import { ReferencesEditorStops } from '@/components/references/stops/ReferencesEditorStops';

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
