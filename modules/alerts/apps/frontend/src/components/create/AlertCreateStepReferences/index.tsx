'use client';

/* * */

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { Alert } from '@tmlmobilidade/types';
import { Section } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepReferences() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Handle actions

	const handleChangeReferenceType = (value: Alert['reference_type']) => {
		alertCreateContext.data.form.setFieldValue('reference_type', value);
	};

	const handleChangeReferences = (references: Alert['references']) => {
		alertCreateContext.data.form.setFieldValue('references', references);
	};

	//
	// C. Render components

	return (
		<ReferencesEditor
			onChangeReferences={handleChangeReferences}
			onChangeReferenceType={handleChangeReferenceType}
			selectedAgencyId={alertCreateContext.data.form.getValues().agency_id}
			selectedMunicipalityIds={alertCreateContext.data.form.getValues().municipality_ids}
			selectedReferences={alertCreateContext.data.form.getValues().references}
			selectedReferenceType={alertCreateContext.data.form.getValues().reference_type}
		/>
	);
}
