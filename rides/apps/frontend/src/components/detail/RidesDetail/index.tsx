'use client';

/* * */

import { type RidesDetailAnalysisResult } from '@/components/detail/RidesDetailAnalysisResult';
import { type RidesDetailAudits } from '@/components/detail/RidesDetailAudits';
import { type RidesDetailDebug } from '@/components/detail/RidesDetailDebug';
import { type RidesDetailHeader } from '@/components/detail/RidesDetailHeader';
import { type RidesDetailJustifications } from '@/components/detail/RidesDetailJustifications';
import { type RidesDetailMap } from '@/components/detail/RidesDetailMap';
import { type RidesDetailMetadata } from '@/components/detail/RidesDetailMetadata';
import { type RidesDetailPerformance } from '@/components/detail/RidesDetailPerformance';
import { type RidesDetailStops } from '@/components/detail/RidesDetailStops';
import { type RidesDetailSupport } from '@/components/detail/RidesDetailSupport';
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
