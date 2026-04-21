'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorAgency } from '@/components/common/references/ReferencesEditorAgency';
import { ReferencesEditorControls } from '@/components/common/references/ReferencesEditorControls';
import { ReferencesEditorLines } from '@/components/common/references/ReferencesEditorLines';
import { ReferencesEditorRides } from '@/components/common/references/ReferencesEditorRides';
import { ReferencesEditorStops } from '@/components/common/references/ReferencesEditorStops';
import { LoadingSection } from '@tmlmobilidade/ui';

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

			{referencesEditorContext.flags.isLoading && <LoadingSection />}

			{!referencesEditorContext.flags.isLoading && referencesEditorContext.data.selected_agency_id && referencesEditorContext.data.selected_reference_type === 'agency' && <ReferencesEditorAgency />}
			{!referencesEditorContext.flags.isLoading && referencesEditorContext.data.selected_agency_id && referencesEditorContext.data.selected_reference_type === 'lines' && <ReferencesEditorLines />}
			{!referencesEditorContext.flags.isLoading && referencesEditorContext.data.selected_agency_id && referencesEditorContext.data.selected_reference_type === 'stops' && <ReferencesEditorStops />}
			{!referencesEditorContext.flags.isLoading && referencesEditorContext.data.selected_agency_id && referencesEditorContext.data.selected_reference_type === 'rides' && <ReferencesEditorRides />}

		</>
	);
}
