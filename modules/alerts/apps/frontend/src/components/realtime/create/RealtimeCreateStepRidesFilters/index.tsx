'use client';

/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Grid, MultiSelect, SearchInput, Section } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepRidesFilters() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a">
				<SearchInput onChange={realtimeCreateContext.filters.search.set} value={realtimeCreateContext.filters.search.value} />
			</Grid>
			<Grid columns="ab" gap="md">
				<MultiSelect
					data={realtimeCreateContext.filters.lines.options}
					leftSection={<IconArrowLoopRight size={20} />}
					onChange={realtimeCreateContext.filters.lines.set}
					placeholder="Filtrar por linhas..."
					value={realtimeCreateContext.filters.lines.value}
				/>
				<MultiSelect
					data={realtimeCreateContext.filters.stops.options}
					onChange={realtimeCreateContext.filters.stops.set}
					placeholder="Filtrar por paragens..."
					value={realtimeCreateContext.filters.stops.value}
				/>
			</Grid>
		</Section>
	);

	//
}
