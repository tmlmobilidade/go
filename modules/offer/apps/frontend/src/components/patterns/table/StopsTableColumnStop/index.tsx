'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PopulatedPath } from '@tmlmobilidade/go-types-offer';
import { Text } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from '../styles.module.css';

/* * */

export function PathTableColumnStop({ pathItem }: { pathItem: PopulatedPath }) {
	//

	//
	// A. Setup variables

	//
	// B. Handle actions

	const handleOpenStop = () => {
		if (pathItem.stop_id) {
			window.open(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(pathItem.stop_id)), '_blank', 'noopener,noreferrer');
		}
	};

	const stopLocationInfo = useMemo(() => {
		const location = pathItem.stop?.location;
		if (!location) return null;
		const { neighbourhood, secondary } = location;
		return neighbourhood && neighbourhood.name !== secondary.name ? `${neighbourhood.name}, ${secondary.name}` : secondary.name;
	}, [pathItem.stop?.location]);

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
