'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Grid, MultiSelect, SearchInput, Section } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorRidesFilters() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section gap="md" padding="none">
			<Grid columns="a">
				<SearchInput onChange={referencesEditorContext.filters.search.set} value={referencesEditorContext.filters.search.value} />
			</Grid>
			<Grid columns="ab" gap="md">
				<MultiSelect
					data={referencesEditorContext.filters.lines.options}
					leftSection={<IconArrowLoopRight size={20} />}
					onChange={referencesEditorContext.filters.lines.set}
					placeholder="Filtrar por linhas..."
					value={referencesEditorContext.filters.lines.value}
				/>
				<MultiSelect
					data={referencesEditorContext.filters.stops.options}
					onChange={referencesEditorContext.filters.stops.set}
					placeholder="Filtrar por paragens..."
					value={referencesEditorContext.filters.stops.value}
				/>
			</Grid>
		</Section>
	);

	//
}
