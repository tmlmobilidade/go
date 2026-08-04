'use client';

/* * */

import { CmOperatorPanels } from '@/agencies/cm/CmOperatorPanels';
import { CM_AGENCY_IDS, type CmAgencyId } from '@/agencies/cm/constants';
import { VideowallHeader } from '@/components/videowall/VideowallHeader';
import { VideowallMetricsContextProvider } from '@/contexts/VideowallMetrics.context';
import { useAppReload } from '@/hooks/use-app-reload';
import { type NumberAnimationConfig } from '@/types/number-animation';

import styles from './styles.module.css';

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
			<div className={styles.container}>
				<VideowallHeader agencyName={agencyName} areaNumber={areaNumber} />
				<div className={styles.content}>
					<CmOperatorPanels agencyId={agencyId} />
				</div>
			</div>
		</VideowallMetricsContextProvider>
	);

	//
}
