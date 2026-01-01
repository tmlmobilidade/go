'use client';

/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Grid, MultiSelect, SearchInput, Section } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorRidesFilters() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a">
				<SearchInput onChange={alertCreateContext.filters.search.set} value={alertCreateContext.filters.search.value} />
			</Grid>
			<Grid columns="ab" gap="md">
				<MultiSelect
					data={alertCreateContext.filters.lines.options}
					leftSection={<IconArrowLoopRight size={20} />}
					onChange={alertCreateContext.filters.lines.set}
					placeholder="Filtrar por linhas..."
					value={alertCreateContext.filters.lines.value}
				/>
				<MultiSelect
					data={alertCreateContext.filters.stops.options}
					onChange={alertCreateContext.filters.stops.set}
					placeholder="Filtrar por paragens..."
					value={alertCreateContext.filters.stops.value}
				/>
			</Grid>
		</Section>
	);

	//
}
