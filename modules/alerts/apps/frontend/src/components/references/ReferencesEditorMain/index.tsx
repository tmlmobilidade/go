'use client';

import { useReferencesEditorContext } from '@/components/references/ReferencesEditor.context';
import { ReferencesEditorAgency } from '@/components/references/ReferencesEditorAgency';
import { ReferencesEditorControls } from '@/components/references/ReferencesEditorControls';
import { ReferencesEditorLines } from '@/components/references/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/references/ReferencesEditorRides';
import { ReferencesEditorStops } from '@/components/references/ReferencesEditorStops';

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
