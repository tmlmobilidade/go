'use client';

import { HolidaysDetailBasicInfo } from '@/components/holidays/detail/HolidaysDetailBasicInfo';
import { HolidaysDetailDates } from '@/components/holidays/detail/HolidaysDetailDates';
import { HolidaysDetailHeader } from '@/components/holidays/detail/HolidaysDetailHeader';
import { ErrorDisplay, Pane } from '@tmlmobilidade/ui';

import { useHolidaysDetailData } from '../use-holidays-detail-data';

/* * */

export function HolidaysDetail() {
	//

	//
	// A. Setup variables

	const { error, isLoading } = useHolidaysDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<HolidaysDetailHeader key="header" />]} isLoading={isLoading}>
			{error && <ErrorDisplay message={error} />}
			<HolidaysDetailBasicInfo />
			<HolidaysDetailDates />
		</Pane>
	);
}
