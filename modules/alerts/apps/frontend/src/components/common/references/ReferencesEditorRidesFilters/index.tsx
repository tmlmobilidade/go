'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { type HashedTrip, type HashedTripWaypoint } from '@tmlmobilidade/types';
import { Grid, MultiSelect, SearchInput, Section, SegmentedControl, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorRidesFiltersProps {
	lineIdsFilterValue: string[]
	searchFilterValue: string
	setLineIdsFilterValue: (value: string[] | undefined) => void
	setSearchFilterValue: (value: string | undefined) => void
	setStopIdsFilterValue: (value: string[] | undefined) => void
	setViewMode: (value: 'all' | 'selected') => void
	stopIdsFilterValue: string[]
	viewMode: 'all' | 'selected'
}

/* * */

export function ReferencesEditorRidesFilters({ lineIdsFilterValue, searchFilterValue, setLineIdsFilterValue, setSearchFilterValue, setStopIdsFilterValue, setViewMode, stopIdsFilterValue, viewMode }: ReferencesEditorRidesFiltersProps) {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const lineIdsFilterOptions = useMemo(() => {
		// Skip if there are no hashedTrips
		if (!referencesEditorContext.data.hashed_trips.length) return;
		// Populate lines filter options based on fetched rides
		const uniqueLinesMap = new Map<HashedTrip['line_id'], SelectDataItem>();
		referencesEditorContext.data.hashed_trips.forEach((item) => {
			if (uniqueLinesMap.has(item.line_id)) return;
			uniqueLinesMap.set(item.line_id, {
				label: `[${item.line_short_name}] ${item.line_long_name}`,
				value: String(item.line_id),
			});
		});
		// Return the unique lines as an array of SelectDataItem.
		return Array.from(uniqueLinesMap.values());
	}, [referencesEditorContext.data.hashed_trips]);

	const stopIdsFilterOptions = useMemo(() => {
		// Skip if there are no hashedTrips
		if (!referencesEditorContext.data.hashed_trips.length) return;
		// Populate stops filter options based on fetched rides
		const uniqueStopsMap = new Map<HashedTripWaypoint['stop_id'], SelectDataItem>();
		referencesEditorContext.data.hashed_trips
			.flatMap(trip => trip.path)
			.forEach((item) => {
				if (uniqueStopsMap.has(item.stop_id)) return;
				uniqueStopsMap.set(item.stop_id, {
					label: `[${item.stop_id}] ${item.stop_name}`,
					value: String(item.stop_id),
				});
			});
		// Return the unique stops as an array of SelectDataItem.
		return Array.from(uniqueStopsMap.values());
	}, [referencesEditorContext.data.hashed_trips]);

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">

				<SegmentedControl
					onChange={setViewMode}
					value={viewMode}
					data={[
						{ label: `Ver todas as circulações (${referencesEditorContext.flags.isLoading ? 'Loading...' : referencesEditorContext.data.rides?.length ?? 0})`, value: 'all' },
						{ label: `Apenas as Selecionadas (${referencesEditorContext.data.selected_references.length ?? 0})`, value: 'selected' },
					]}
				/>

				{viewMode === 'all' && (
					<>
						<SearchInput onChange={setSearchFilterValue} value={searchFilterValue} />

						<Grid columns="ab" gap="md">
							<MultiSelect
								data={lineIdsFilterOptions}
								leftSection={<IconArrowLoopRight size={20} />}
								onChange={setLineIdsFilterValue}
								placeholder="Filtrar por linhas..."
								value={lineIdsFilterValue}
							/>
							<MultiSelect
								data={stopIdsFilterOptions}
								onChange={setStopIdsFilterValue}
								placeholder="Filtrar por paragens..."
								value={stopIdsFilterValue}
							/>
						</Grid>
					</>
				)}

			</Grid>
		</Section>
	);

	//
}
