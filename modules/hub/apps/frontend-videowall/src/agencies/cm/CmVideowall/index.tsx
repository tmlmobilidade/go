'use client';

/* * */

import { CmMetricsGrid } from '@/agencies/cm/CmMetricsGrid';
import { CM_AGENCY_IDS } from '@/agencies/cm/constants';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallLayout } from '@/components/videowall/VideowallLayout';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';

/* * */

export function CmVideowall() {
	//

	//
	// A. Setup variables

	useAppReload();

	//
	// B. Render components

	return (
		<VideowallMetricsContextProvider
			agencyIds={CM_AGENCY_IDS}
			numberAnimation={AGENCY_ROUTE_CONFIG.cm.number_animation}
		>
			<VideowallLayout header={<VideowallHeader scope="aggregate" />}>
				<CmMetricsGrid scope="aggregate" />
			</VideowallLayout>
		</VideowallMetricsContextProvider>
	);

	//
}
