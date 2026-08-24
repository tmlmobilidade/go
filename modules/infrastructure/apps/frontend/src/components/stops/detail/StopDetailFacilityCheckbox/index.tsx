/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
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
	const stopId = stopDetailContext.data.stop?._id;

	//
	// B. Render components

	const checkbox = (
		<Checkbox
			checked={stopDetailContext.data.form.values.facilities?.includes(value) ?? false}
			label={label}
			onChange={(e) => {
				const facilities = stopDetailContext.data.form.values.facilities ?? [];
				const isChecked = e.target.checked;
				const newFacilities = isChecked ? [...facilities, value] : facilities.filter(f => f !== value);
				stopDetailContext.data.form.setFieldValue('facilities', newFacilities);
			}}
		/>
	);

	return proposeable ? <ProposedChangesWrapper inputName={value} relatedId={String(stopId)} scope="stop">{checkbox}</ProposedChangesWrapper> : checkbox;

	//
}
