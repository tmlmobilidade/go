'use client';

import { ErrorDisplay, Grid, Pane, Section } from '@tmlmobilidade/ui';

import { HolidaysDatesSelector } from '../HolidaysDatesSelector';
import { HolidaysDetailBasicInfo } from '../HolidaysDetailBasicInfo';
import { HolidaysDetailHeader } from '../HolidaysDetailHeader';
import { useHolidaysDetailData } from '../use-holidays-detail-data';

/* * */

export function HolidaysDetail() {
	//

	//
	// A. Fetch data

	const { error, isLoading } = useHolidaysDetailData();

	//
	// B. Render components

	return (
		<Pane header={[<HolidaysDetailHeader key="header" />]} isLoading={isLoading}>
			{error ? (
				<ErrorDisplay message={error} />
			) : (
				<Section>
					<Grid columns="a" gap="lg">
						<HolidaysDetailBasicInfo />
						<HolidaysDatesSelector />
					</Grid>
				</Section>
			)}
		</Pane>
	);

	//
}
