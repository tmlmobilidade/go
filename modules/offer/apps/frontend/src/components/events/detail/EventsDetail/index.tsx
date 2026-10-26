'use client';

import { ErrorDisplay, Grid, LoadingOverlay, Pane, Section } from '@tmlmobilidade/ui';

import { EventsDatesSelector } from '../EventsDatesSelector';
import { EventsDetailBasicInfo } from '../EventsDetailBasicInfo';
import { EventsDetailHeader } from '../EventsDetailHeader';
import { EventsDetailRules } from '../EventsDetailRules';
import { useEventsDetailData } from '../use-events-detail-data';

/* * */

export function EventsDetail() {
	//

	//
	// A. Setup variables

	const { data, error, isLoading } = useEventsDetailData();

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;
	if (isLoading || !data) return <LoadingOverlay />;

	return (
		<Pane header={[<EventsDetailHeader key="header" />]}>
			<Section>
				<Grid columns="a" gap="lg">
					<EventsDetailBasicInfo />
					<EventsDatesSelector />
					<EventsDetailRules />
				</Grid>
			</Section>
		</Pane>
	);
}
