/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { StopFacilitySchema } from '@tmlmobilidade/types';
import { Checkbox, ProposedChangesWrapper } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

interface StopDetailFacilityCheckboxProps {
	label: string
	proposeable?: boolean
	value: typeof StopFacilitySchema.options[number]
}

/* * */

export function StopDetailFacilityCheckbox({ label, proposeable, value }: StopDetailFacilityCheckboxProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const form = stopDetailContext.data.form;
	const stopId = stopDetailContext.data.stop?._id;

	//
	// B. Render components

	const checkbox = (
		<Checkbox
			checked={form.values.facilities?.includes(value) ?? false}
			label={label}
			onChange={(e) => {
				const facilities = form.values.facilities ?? [];
				const isChecked = e.target.checked;
				const newFacilities = isChecked ? [...facilities, value] : facilities.filter(f => f !== value);
				form.setFieldValue('facilities', newFacilities);
			}}
		/>
	);

	return proposeable ? <ProposedChangesWrapper inputName={value} relatedId={stopId} scope="stop">{checkbox}</ProposedChangesWrapper> : checkbox;

	//
}
