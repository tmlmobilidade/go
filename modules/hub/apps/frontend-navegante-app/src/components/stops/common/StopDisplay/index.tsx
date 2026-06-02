/* * */

import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { StopDisplayName } from '@/components/stops/common/StopDisplayName';
import { Skeleton } from '@mantine/core';
import { type HubStop } from '@tmlmobilidade/types';

import styles from './styles.module.css';

/* * */

interface StopDisplayProps {
	size?: 'lg' | 'md'
	skeletonWidth?: number
	stopData?: HubStop
}

/* * */

export function StopDisplay({ size = 'md', skeletonWidth = 200, stopData }: StopDisplayProps) {
	return stopData
		? (
			<div className={`${styles.container} ${styles[size]}`}>
				<StopDisplayName longName={stopData.name} />
				<StopDisplayLocation localityName={stopData.locality_name} municipalityName={stopData.municipality_name} />
			</div>
		)
		: (
			<div className={styles.container}>
				<Skeleton height={24} width={skeletonWidth} />
			</div>
		);
}
