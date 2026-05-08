'use client';

import { ContainerWrapper } from '@/components/layout/ContainerWrapper';
import { Skeleton } from '@tmlmobilidade/ui';

/* * */

export function MetricCardSkeleton({ height }: { height?: number | string }) {
	//

	//
	// A. Render components

	return (
		<ContainerWrapper height={height}>
			<Skeleton height="20%" width="40%" />
			<Skeleton height="10%" width="80%" />
			<Skeleton height="30%" style={{ marginTop: 'auto' }} width="100%" />
		</ContainerWrapper>
	);
}
