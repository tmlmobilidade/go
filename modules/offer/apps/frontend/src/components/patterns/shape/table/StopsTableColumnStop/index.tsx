'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PopulatedPath } from '@tmlmobilidade/types';
import { Text, useLocationsContext } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import styles from '../styles.module.css';

/* * */

export function PathTableColumnStop({ pathItem }: { pathItem: PopulatedPath }) {
	//

	//
	// A. Setup variables

	const locationsContext = useLocationsContext();
	const router = useRouter();

	//
	// B. Handle actions

	const handleOpenStop = () => {
		if (pathItem.stop_id) {
			router.push(PAGE_ROUTES.stops.STOPS_DETAIL(String(pathItem.stop_id)));
		}
	};

	const stopLocationInfo = useMemo(() => {
		if (!pathItem.stop) return null;

		const municipalityData = pathItem.stop.municipality_id
			? locationsContext.data.municipalities_map?.get(pathItem.stop.municipality_id)
			: undefined;

		const localityData = pathItem.stop.locality_id
			? locationsContext.data.localitites_map?.get(pathItem.stop.locality_id)
			: undefined;

		const localityName = localityData?.name;
		const municipalityName = municipalityData?.name;

		if (!localityName && !municipalityName) return null;
		if (localityName && !municipalityName) return localityName;
		if (!localityName && municipalityName) return municipalityName;
		if (localityName === municipalityName) return localityName;

		return `${localityName}, ${municipalityName}`;
	}, [pathItem.stop, locationsContext.data.municipalities_map, locationsContext.data.localitites_map]);

	//
	// C. Render components

	if (!pathItem.stop) {
		return (
			<div className={styles.column} style={{ padding: 'var(--size-spacing-sm) 0' }}>
				<div className={styles.sequenceStop}>
					<Text size="sm">Stop ID: {pathItem.stop_id}</Text>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.column} style={{ padding: 'var(--size-spacing-sm) 0' }}>
			<div className={styles.sequenceStop} onClick={handleOpenStop}>
				<Text>{pathItem.stop.name}</Text>
				{stopLocationInfo && <Text size="sm">{stopLocationInfo}</Text>}
				<Text c="var(--color-system-text-200)" size="xs">#{pathItem.stop._id}</Text>
			</div>
		</div>
	);

	//
}
