/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Checkbox, ProposedChangesWrapper } from '@tmlmobilidade/ui';
import React from 'react';

/* * */

export function StopDetailFacilityCheckbox({ label, value }) {
	const stopDetailContext = useStopDetailContext();
	const form = stopDetailContext.data.form;
	const stopId = stopDetailContext.data.stop?._id;

	return (
		<ProposedChangesWrapper
			inputName={value}
			relatedId={stopId}
			scope="stop"
		>
			<Checkbox
				checked={form.values.facilities?.includes(value) ?? false}
				label={label}
				onChange={(e) => {
					const facilities = form.values.facilities ?? [];
					const isChecked = e.target.checked;
					const newFacilities = isChecked
						? [...facilities, value]
						: facilities.filter(f => f !== value);
					form.setFieldValue('facilities', newFacilities);
				}}
			/>
		</ProposedChangesWrapper>
	);
}
