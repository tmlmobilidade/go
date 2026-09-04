/* * */

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { StopFacilityValues } from '@tmlmobilidade/go-types-infrastructure';
import { Checkbox } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

interface StopDetailFacilityCheckboxProps {
	label: string
	value: typeof StopFacilityValues[number]
}

/* * */

export function StopDetailFacilityCheckbox({ label, value }: StopDetailFacilityCheckboxProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

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

	return checkbox;

	//
}
