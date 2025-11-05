'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Grid, Label, LineSelect, SearchInput, Section, StopSelect } from '@go/ui';

/* * */

export function RealtimeStepTripsFilters() {
	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	//
	// B. Render components

	return (
		<Section flexDirection="column" gap="sm" padding="none">
			<Label>Filtros</Label>
			<SearchInput
				onChange={ridesContext.actions.setFilterSearch}
				size="xl"
				value={ridesContext.filters.search}
			/>
			<Grid columns="ab" gap="sm">
				<LineSelect
					data={ridesContext.data.filteredLines}
					label="Linha"
					loading={ridesContext.flags.isFiltering}
					onSelectLineId={ridesContext.actions.setFilterLineId}
					selectedLineId={ridesContext.filters.lineId}
					variant="default"
				/>
				<StopSelect
					data={ridesContext.data.filteredStops}
					label="Paragem"
					loading={ridesContext.flags.isFiltering}
					onSelectStopId={ridesContext.actions.setFilterStopId}
					selectedStopId={ridesContext.filters.stopId}
					variant="default"
				/>
			</Grid>
		</Section>
	);
}
