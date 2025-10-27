'use client';

/* * */

import { VisualizationContainer } from '@/components/layout/VisualizationContainer';
import { Skeleton } from '@tmlmobilidade/ui';

/* * */

export function KpiCardSkeleton({ height }: { height?: number | string }) {
	//

	//
	// A. Render components

	return (
		<VisualizationContainer height={height}>
			<Skeleton height="20%" width="40%" />
			<Skeleton height="10%" width="80%" />
			<Skeleton height="30%" style={{ marginTop: 'auto' }} width="100%" />
		</VisualizationContainer>
	);
}
