/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Label } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ValidationsListCellDateProps {
	value: UnixTimestamp
}

/* * */

export function ValidationsListCellDate({ value }: ValidationsListCellDateProps) {
	//

	//
	// A. Transform data

	const formattedDateString = useMemo(() => {
		// Skip if no value
		if (!value) return 'N/A';
		// Convert the Unix timestamp to a Date object.
		return Dates
			.fromUnixTimestamp(value)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('dd \'de\' LLLL \'de\' yyyy \'às\' HH:mm', { locale: 'pt-PT' });
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
