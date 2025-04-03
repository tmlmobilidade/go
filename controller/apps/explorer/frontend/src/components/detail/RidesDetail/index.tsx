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
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function RidesDetail() {
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
}
