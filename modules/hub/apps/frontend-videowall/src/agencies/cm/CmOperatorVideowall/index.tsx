'use client';

/* * */

import { CmMetricsGrid } from '@/agencies/cm/CmMetricsGrid';
import { CM_AGENCY_IDS, type CmAgencyId } from '@/agencies/cm/constants';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallLayout } from '@/components/videowall/VideowallLayout';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';
import { type NumberAnimationConfig } from '@/types/number-animation';

/* * */

interface Props {
	agencyId: CmAgencyId
	agencyName: string
	areaNumber: number
	numberAnimation: NumberAnimationConfig
}

/* * */

export function CmOperatorVideowall({
	agencyId,
	agencyName,
	areaNumber,
	numberAnimation,
}: Props) {
	//

	//
	// A. Setup variables

	useAppReload();

	//
	// B. Render components

	return (
		<VideowallMetricsContextProvider agencyIds={CM_AGENCY_IDS} numberAnimation={numberAnimation}>
			<VideowallLayout
				header={<VideowallHeader agencyName={agencyName} areaNumber={areaNumber} scope="agency" />}
			>
				<CmMetricsGrid agencyId={agencyId} scope="agency" />
			</VideowallLayout>
		</VideowallMetricsContextProvider>
	);

	//
}
