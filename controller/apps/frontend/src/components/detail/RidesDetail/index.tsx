'use client';

/* * */

import { RidesDetailAnalysisResult } from '@/components/detail/RidesDetailAnalysisResult';
import { RidesDetailAudits } from '@/components/detail/RidesDetailAudits';
import { RidesDetailDebug } from '@/components/detail/RidesDetailDebug';
import { RidesDetailHeader } from '@/components/detail/RidesDetailHeader';
import { RidesDetailJustifications } from '@/components/detail/RidesDetailJustifications';
import { RidesDetailMap } from '@/components/detail/RidesDetailMap';
import { RidesDetailMetadata } from '@/components/detail/RidesDetailMetadata';
import { RidesDetailPerformance } from '@/components/detail/RidesDetailPerformance';
import { RidesDetailStops } from '@/components/detail/RidesDetailStops';
import { RidesDetailSupport } from '@/components/detail/RidesDetailSupport';
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
