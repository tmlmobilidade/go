'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Label, Tag } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

/* * */

export function RidesListUpdatedAt() {
	//

	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	const [lastUpdatedAtString, setLastUpdatedAtString] = useState<string>('---');

	//
	// B. Transform data

	useEffect(() => {
		const updateString = () => {
			const diff = DateTime.now().toMillis() - ridesContext.data.last_update; // milliseconds
			if (diff < 1000) return setLastUpdatedAtString('• Live');
			if (diff < 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000)} segundos`);
			if (diff < 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60)} minutes ago`);
			if (diff < 24 * 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60)} hours ago`);
			return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60 / 24)} days ago`);
		};
		updateString();
		const interval = setInterval(updateString, 1000);
		return () => clearInterval(interval);
	}, [ridesContext.data.last_update]);

	//
	// C. Render components

	return (
		<Tag label={lastUpdatedAtString} variant="muted" />
	);

	//
}
