'use client';

/* * */

import { AGENCY_ROUTE_CONFIG } from '@/agencies/config';
import { TtslDashboard } from '@/agencies/ttsl/TtslDashboard';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallLayout } from '@/components/videowall/VideowallLayout';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';

/* * */

const TTSL_AGENCY_IDS = [AGENCY_ROUTE_CONFIG.ttsl.agency_id] as const;

/* * */

export function TtslVideowall() {
	useAppReload();

	return (
		<VideowallMetricsContextProvider
			agencyIds={TTSL_AGENCY_IDS}
			numberAnimation={AGENCY_ROUTE_CONFIG.ttsl.number_animation}
		>
			<VideowallLayout
				header={(
					<VideowallHeader
						agency={AGENCY_ROUTE_CONFIG.ttsl}
						scope="standalone"
					/>
				)}
			>
				<TtslDashboard />
			</VideowallLayout>
		</VideowallMetricsContextProvider>
	);
}
