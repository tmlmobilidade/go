'use client';

import { LinesOverviewHeader } from '@/components/lines/overview/LinesOverviewHeader';
import { LinesOverviewMap } from '@/components/lines/overview/LinesOverviewMap';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function LinesOverview() {
	//

	//
	// A. Render components

	return (
		<Pane header={[<LinesOverviewHeader key="lines-overview-header" />]}>
			<LinesOverviewMap />
		</Pane>
	);

	//
}
