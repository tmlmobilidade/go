/* * */

import { type UnixTimestamp } from '@go/types';
import { Label } from '@tmlmobilidade/ui';
import { Dates } from '@go/utils-dates';
import { useMemo } from 'react';

/* * */

interface AlertsListCellDateProps {
	value: UnixTimestamp
}

/* * */

export function AlertsListCellDate({ value }: AlertsListCellDateProps) {
	//

	//
	// A. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!value) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(value)
			.toLocaleString({ day: '2-digit', hour: '2-digit', minute: '2-digit', month: 'long', year: 'numeric' }, 'pt-PT');
	}, [value]);

	//
	// B. Render components

	return (
		<Label>
			{formattedDateString}
		</Label>
	);

	//
}
