'use client';

import { formatStopLocation } from '@/utils/format-stop-location';

import styles from './styles.module.css';

/* * */

interface StopDisplayLocationProps {
	localityName?: string
	municipalityName?: string
	size?: 'lg' | 'md'
}

/* * */

export function StopDisplayLocation({ localityName, municipalityName, size = 'md' }: StopDisplayLocationProps) {
	//

	//
	// A. Transform data

	const location = formatStopLocation(localityName, municipalityName);

	//
	// B. Render components

	if (!location) return null;

	return (
		<p className={`${styles.location} ${styles[size]}`}>
			{location}
		</p>
	);
}
