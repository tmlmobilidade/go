'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { PatternDetailHeader } from '@/components/patterns/detail/PatternDetailHeader';
import { PatternDetailSectionConfig } from '@/components/patterns/detail/PatternDetailSectionConfig';
import { PatternDetailSectionGtfs } from '@/components/patterns/detail/PatternDetailSectionGtfs';
import { PatternDetailSectionRules } from '@/components/patterns/detail/PatternDetailSectionRules';
import { PatternDetailSectionShape } from '@/components/patterns/detail/PatternDetailSectionShape';
import { PatternDetailSectionStops } from '@/components/patterns/detail/PatternDetailSectionStops';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

/* * */

export function PatternDetail() {
	//

	//
	// A. Setup variables

	const lineDetailContext = usePatternDetailContext();

	//
	// B. Render components

	if (lineDetailContext.flags.isLoading) {
		return <LoadingOverlay />;
	}

	if (lineDetailContext.flags.error) {
		return <ErrorDisplay message={lineDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<PatternDetailHeader />]}>
			<PatternDetailSectionConfig />
			<PatternDetailSectionShape />
			<PatternDetailSectionStops />
			<PatternDetailSectionGtfs />
			<PatternDetailSectionRules />
		</Pane>
	);

	//
}
