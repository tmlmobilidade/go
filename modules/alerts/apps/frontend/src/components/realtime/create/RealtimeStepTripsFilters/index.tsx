'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Grid, Label, LineSelect, SearchInput, Section, StopSelect } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RealtimeStepTripsFilters() {
	//
	// A. Setup variables

	const ridesContext = useRidesContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create.stepTripsFilter' });

	//
	// B. Render components

	return (
		<Section flexDirection="column" gap="sm" padding="none">
			<Label>{t('title')}</Label>
			<SearchInput
				onChange={ridesContext.actions.setFilterSearch}
				size="xl"
				value={ridesContext.filters.search}
			/>
			<Grid columns="ab" gap="sm">
				<LineSelect
					data={ridesContext.data.filteredLines}
					label={t('fields.line_select_label')}
					loading={ridesContext.flags.isFiltering}
					onSelectLineId={ridesContext.actions.setFilterLineId}
					selectedLineId={ridesContext.filters.lineId}
					variant="default"
				/>
				<StopSelect
					data={ridesContext.data.filteredStops}
					label={t('fields.stop_select_label')}
					loading={ridesContext.flags.isFiltering}
					onSelectStopId={ridesContext.actions.setFilterStopId}
					selectedStopId={ridesContext.filters.stopId}
					variant="default"
				/>
			</Grid>
		</Section>
	);
}
