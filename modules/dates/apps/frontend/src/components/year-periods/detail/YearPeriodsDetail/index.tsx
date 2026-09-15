'use client';

import { YearPeriodsDetailBasicInfo } from '@/components/year-periods/detail/YearPeriodsDetailBasicInfo';
import { YearPeriodsDetailHeader } from '@/components/year-periods/detail/YearPeriodsDetailHeader';
import { ErrorDisplay, Pane } from '@tmlmobilidade/ui';

import { useYearPeriodsDetailData } from '../use-year-periods-detail-data';

/* * */

export function YearPeriodsDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useYearPeriodsDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<YearPeriodsDetailHeader key="header" />]} isLoading={isLoading}>
			{error && <ErrorDisplay message={error} />}
			<YearPeriodsDetailBasicInfo />
		</Pane>
	);
}
