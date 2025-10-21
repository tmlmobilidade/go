/* * */

import { Checkbox } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

export function FacilityCheckbox({ form, label, value }) {
	//

	//
	// A. Setup variables

	const checked = form.values.facilities?.includes(value) ?? false;

	//
	// B. Render components
	return (
		<Checkbox
			checked={checked}
			label={label}
			onChange={(e) => {
				const facilities = form.values.facilities ?? [];
				const isChecked = e.target.checked;
				const newFacilities = isChecked ? [...facilities, value] : facilities.filter(f => f !== value);
				form.setFieldValue('facilities', newFacilities);
			}}
		/>
	);
}
