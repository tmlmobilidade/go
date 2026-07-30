'use client';

/* * */

import { CM_AGENCY_IDS } from '@/agencies/cm/constants';
import { DelaysPanel } from '@/agencies/cm/DelaysPanel';
import { DemandPanel } from '@/agencies/cm/DemandPanel';
import { DistancePanel } from '@/agencies/cm/DistancePanel';
import { ServiceFailuresPanel } from '@/agencies/cm/ServiceFailuresPanel';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { PanelGrid } from '@/components/common/PanelGrid';
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
			<PanelGrid>
				<DemandPanel />
				<ServiceFailuresPanel />
				<DelaysPanel />
				<DistancePanel />
			</PanelGrid>
		</VideowallMetricsContextProvider>
	);

	//
}
