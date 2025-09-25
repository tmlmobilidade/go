'use client';

/* * */

import { AnalysisStatusTag } from '@/components/common/AnalysisStatusTag';
import { OperationalStatusTag } from '@/components/common/OperationalStatusTag';
import { RidesDetailSystemStatus } from '@/components/rides/detail/RidesDetail/RidesDetailSystemStatus';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { useRidesDetailAcceptanceContext } from '@/contexts/RidesDetailAcceptance.context';
import { BackButton, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/utils';
import { useRouter } from 'next/navigation';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const ridesDetailContext = useRidesDetailContext();
	const acceptance = useRidesDetailAcceptanceContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		const destUrl = keepUrlParams(`/rides`, window.location.search);
		router.push(destUrl);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<BackButton onClick={handleGoBack} type="close" />
			<Tag label={ridesDetailContext.data.ride_id} variant="muted" />
			<Spacer />
			<RidesDetailSystemStatus />
			<AnalysisStatusTag analysis={acceptance.data.acceptance?.analysis_summary} />
			<OperationalStatusTag value={ridesDetailContext.data.ride?.operational_status} />
		</Toolbar>
	);

	//
}
