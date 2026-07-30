'use client';

/* * */

import { CmOperatorPanels } from '@/agencies/cm/CmOperatorPanels';
import { CM_AGENCY_IDS, type CmAgencyId } from '@/agencies/cm/constants';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';
import { type NumberAnimationConfig } from '@/types/number-animation';

/* * */

interface Props {
	agencyId: CmAgencyId
	agencyLabel: string
	demandDisplay?: 'cards' | 'chart'
	numberAnimation: NumberAnimationConfig
}

/* * */

export function CmOperatorVideowall({
	agencyId,
	agencyLabel,
	demandDisplay = 'cards',
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
			<CmOperatorPanels
				agencyId={agencyId}
				agencyLabel={agencyLabel}
				demandDisplay={demandDisplay}
			/>
		</VideowallMetricsContextProvider>
	);

	//
}
