'use client';

/* * */

import { CcflDashboard } from '@/agencies/ccfl/CcflDashboard';
import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallLayout } from '@/components/videowall/VideowallLayout';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';

/* * */

const CCFL_AGENCY_IDS = [AGENCY_ROUTE_CONFIG.ccfl.agency_id] as const;

/* * */

export function CcflVideowall() {
	useAppReload();

	return (
		<VideowallMetricsContextProvider
			agencyIds={CCFL_AGENCY_IDS}
			numberAnimation={AGENCY_ROUTE_CONFIG.ccfl.number_animation}
		>
			<VideowallLayout
				header={(
					<VideowallHeader
						agencyId={AGENCY_ROUTE_CONFIG.ccfl.agency_id}
						agencyName={AGENCY_ROUTE_CONFIG.ccfl.name}
						scope="standalone"
						secondaryLabel={AGENCY_ROUTE_CONFIG.ccfl.label}
					/>
				)}
			>
				<CcflDashboard />
			</VideowallLayout>
		</VideowallMetricsContextProvider>
	);
}
