'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { PatternDetailHeader } from '@/components/patterns/detail/PatternDetailHeader';
import { PatternDetailSectionConfig } from '@/components/patterns/detail/PatternDetailSectionConfig';
import { PatternDetailSectionRules } from '@/components/patterns/detail/PatternDetailSectionRules';
import { PatternDetailSectionShape } from '@/components/patterns/detail/PatternDetailSectionShape';
import { ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';

import { PatternDetailSectionTravelTimes } from '../PatternDetailSectionTravelTimes';

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
		<Pane header={[<PatternDetailHeader key="pattern-detail-header" />]}>
			<PatternDetailSectionConfig />
			<PatternDetailSectionShape />
			<PatternDetailSectionTravelTimes />
			<PatternDetailSectionRules />
		</Pane>
	);

	//
}
