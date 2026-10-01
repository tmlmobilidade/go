/* * */

import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { StopDisplayName } from '@/components/stops/common/StopDisplayName';
import { Skeleton } from '@mantine/core';
import { type HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

import styles from './styles.module.css';

/* * */

interface StopDisplayProps {
	searchQuery?: string
	size?: 'lg' | 'md'
	skeletonWidth?: number
	stopData?: HubV1ApiStop
}

/* * */

export function StopDisplay({ searchQuery, size = 'md', skeletonWidth = 200, stopData }: StopDisplayProps) {
	return stopData
		? (
			<div className={`${styles.container} ${styles[size]}`}>
				<StopDisplayName longName={stopData.name} searchQuery={searchQuery} />
				<StopDisplayLocation localityName={stopData.locality_name} municipalityName={stopData.municipality_name} />
			</div>
		)
		: (
			<div className={styles.container}>
				<Skeleton height={24} width={skeletonWidth} />
			</div>
		);
}
