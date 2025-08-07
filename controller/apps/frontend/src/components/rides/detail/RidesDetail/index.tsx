'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/rides/detail/RidesDetailAnalysisResult';
import { RidesDetailAudits } from '@/components/rides/detail/RidesDetailAudits';
import { RidesDetailDebug } from '@/components/rides/detail/RidesDetailDebug';
import { RidesDetailHeader } from '@/components/rides/detail/RidesDetailHeader';
import { RidesDetailJustifications } from '@/components/rides/detail/RidesDetailJustifications';
import { RidesDetailMap } from '@/components/rides/detail/RidesDetailMap';
import { RidesDetailMetadata } from '@/components/rides/detail/RidesDetailMetadata';
import { RidesDetailPerformance } from '@/components/rides/detail/RidesDetailPerformance';
import { RidesDetailStops } from '@/components/rides/detail/RidesDetailStops';
import { RidesDetailSupport } from '@/components/rides/detail/RidesDetailSupport';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Render components

	if (ridesDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (ridesDetailContext.flags.error) {
		return <ErrorDisplay message={ridesDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<RidesDetailHeader />]}>
			<RidesDetailMap />
			<RidesDetailMetadata />
			<RidesDetailAnalysisResult />
			<RidesDetailStops />
			<RidesDetailPerformance />
			<RidesDetailAudits />
			<RidesDetailSupport />
			<RidesDetailJustifications />
			<RidesDetailDebug />
		</Pane>
	);

	//
}
