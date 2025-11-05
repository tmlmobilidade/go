/* * */

import { type UnixTimestamp } from '@tmlmobilidade/go-types';
import { Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { useMemo } from 'react';

/* * */

interface TimestampTagProps {
	value: UnixTimestamp
}

/* * */

export function TimestampTag({ value }: TimestampTagProps) {
	//

	//
	// A. Transform data

	const formattedTimestamp = useMemo(() => {
		if (!value) return 'N/A';
		return Dates
			.fromUnixTimestamp(value)
			.setZone('Europe/Lisbon', 'offset_only')
			.iso;
	}, [value]);

	//
	// B. Render components

	return <Tag label={formattedTimestamp} variant="secondary" />;

	//
}
