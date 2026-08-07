'use client';

/* * */

import { CmMetricsGrid } from '@/agencies/cm/CmMetricsGrid';
import { CM_AGENCY_IDS, type CmAgency } from '@/agencies/cm/constants';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallLayout } from '@/components/videowall/VideowallLayout';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';

/* * */

interface Props {
	agency: CmAgency
}

/* * */

export function CmOperatorVideowall({ agency }: Props) {
	//

	//
	// A. Setup variables

	useAppReload();

	//
	// B. Render components

	return (
		<VideowallMetricsContextProvider agencyIds={CM_AGENCY_IDS} numberAnimation={agency.number_animation}>
			<VideowallLayout
				header={<VideowallHeader agency={agency} areaNumber={agency.area_number} scope="agency" />}
			>
				<CmMetricsGrid agencyId={agency.agency_id} scope="agency" />
			</VideowallLayout>
		</VideowallMetricsContextProvider>
	);

	//
}
