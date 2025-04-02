'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Tag } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

/* * */

export function RidesCatalogUpdatedAt() {
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
			if (diff < 1000) return setLastUpdatedAtString('Live');
			if (diff < 60 * 1000) return setLastUpdatedAtString(`Há ${Math.floor(diff / 1000)} segundos`);
			if (diff < 60 * 60 * 1000) return setLastUpdatedAtString(`Há ${Math.floor(diff / 1000 / 60)} minutes`);
			if (diff < 24 * 60 * 60 * 1000) return setLastUpdatedAtString(`Há ${Math.floor(diff / 1000 / 60 / 60)} horas`);
			return setLastUpdatedAtString(`Há ${Math.floor(diff / 1000 / 60 / 60 / 24)} dias`);
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
