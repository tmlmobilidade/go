'use client';

import { useRidesListContext } from '@/components/rides/list/RidesList.context';
/* * */

import { Tag } from '@tmlmobilidade/ui';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';

/* * */

export function RidesListUpdatedAt() {
	//

	//
	// A. Setup variables

	const ridesListContext = useRidesListContext();

	const [lastUpdatedAtString, setLastUpdatedAtString] = useState<string>('---');

	//
	// B. Transform data

	useEffect(() => {
		const updateString = () => {
			const diff = DateTime.now().toMillis() - ridesListContext.flags.last_update; // milliseconds
			if (diff < 1000) return setLastUpdatedAtString('Live');
			if (diff < 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000)} seg`);
			if (diff < 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60)} min`);
			if (diff < 24 * 60 * 60 * 1000) return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60)} h`);
			return setLastUpdatedAtString(`${Math.floor(diff / 1000 / 60 / 60 / 24)} d`);
		};
		updateString();
		const interval = setInterval(updateString, 1000);
		return () => clearInterval(interval);
	}, [ridesListContext.flags.last_update]);

	//
	// C. Render components

	return <Tag label={ridesListContext.flags.last_update} variant="muted" />;

	//
}
