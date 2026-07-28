/* * */

import { CcflDashboard } from '@/agencies/ccfl/CcflDashboard';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { Viewport } from '@/components/viewport/Viewport';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';

/* * */

const CCFL_AGENCY_IDS = [AGENCY_ROUTE_CONFIG.ccfl.agency_id] as const;

/* * */

export function CcflVideowall() {
	return (
		<VideowallMetricsContextProvider
			agencyIds={CCFL_AGENCY_IDS}
			numberAnimation={AGENCY_ROUTE_CONFIG.ccfl.number_animation}
		>
			<Viewport title="GO Videowall • CCFL">
				<CcflDashboard />
			</Viewport>
		</VideowallMetricsContextProvider>
	);
}
