'use client';

import { Dates } from '@tmlmobilidade/dates';
import { type UnixTimestamp } from '@tmlmobilidade/types';
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
		if (!value) return '-';
		// Formate the date string
		return Dates
			.fromUnixTimestamp(value)
			.toFormat('d MMM y \'às\' HH:mm');
	}, [value]);

	//
	// B. Render components

	return formattedDateString;

	//
}
