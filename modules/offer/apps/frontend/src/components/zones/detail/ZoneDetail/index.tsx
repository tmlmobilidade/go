'use client';

import { ZoneDetailBasicInfo } from '@/components/zones/detail/ZoneDetailBasicInfo';
import { ZoneDetailGeometry } from '@/components/zones/detail/ZoneDetailGeometry';
import { ZoneDetailHeader } from '@/components/zones/detail/ZoneDetailHeader';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { useZonesDetailData } from '../use-zones-detail-data';

/* * */

export function ZoneDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useZonesDetailData();

	//
	// B. Render components

	if (isLoading) {
		return <LoadingOverlay />;
	}

	if (error) {
		return <ErrorDisplay message={error} />;
	}

	return (
		<Pane header={[<ZoneDetailHeader key="header" />]}>
			<ZoneDetailBasicInfo />
			<ZoneDetailGeometry />
		</Pane>
	);

	//
}
