'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { Button, Grid, Label, LineSelect, SearchInput, Section, StopSelect } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepRidesFilters() {
	//
	// A. Setup variables

	const ridesContext = useRidesContext();

	//
	// B. Render components

	return (
		<Section gap="lg">
			<Grid columns="aab">
				<SearchInput onChange={ridesContext.actions.setFilterSearch} value={ridesContext.filters.search} />
				<Button
					label="Limpar Filtros"
					onClick={ridesContext.actions.clearFilters}
					variant="danger"
				/>
			</Grid>
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
