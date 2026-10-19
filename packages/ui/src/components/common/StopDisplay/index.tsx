/* * */

import type { HubV1ApiStop } from '@tmlmobilidade/go-types-hub';

import { Skeleton } from '@mantine/core';

import styles from './styles.module.css';

import { StopBadge } from '../StopBadge';
import { StopDisplayName } from '../StopDisplayName';

/* * */

interface Props {
	size?: 'lg' | 'md'
	skeletonWidth?: number
	stopData?: HubV1ApiStop
}

/* * */

export function StopDisplay({ size = 'md', skeletonWidth = 200, stopData }: Props) {
	return stopData
		? (
			<div className={`${styles.container} ${styles[size]}`}>
				<StopBadge stopId={stopData._id.toString()} />
				<StopDisplayName longName={stopData.name} size={size} />
			</div>
		)
		: (
			<div className={styles.container}>
				<Skeleton height={24} width={skeletonWidth} />
			</div>
		);
}
