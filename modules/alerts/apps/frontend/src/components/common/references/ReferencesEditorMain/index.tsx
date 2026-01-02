'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorControls } from '@/components/common/references/ReferencesEditorControls';
import { ReferencesEditorLines } from '@/components/common/references/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/common/references/ReferencesEditorRides';
import { ReferencesEditorStops } from '@/components/common/references/ReferencesEditorStops';

/* * */

export function ReferencesEditorMain() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	console.log('referencesEditorContext.data.selected_reference_type', referencesEditorContext.data.selected_reference_type);

	return (
		<>

			<ReferencesEditorControls />

			{referencesEditorContext.data.selected_reference_type === 'lines' && <ReferencesEditorLines />}
			{referencesEditorContext.data.selected_reference_type === 'stops' && <ReferencesEditorStops />}
			{referencesEditorContext.data.selected_reference_type === 'rides' && <ReferencesEditorRides />}

		</>
	);
}
