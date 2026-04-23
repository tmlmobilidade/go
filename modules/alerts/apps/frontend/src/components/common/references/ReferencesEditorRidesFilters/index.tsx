'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Grid, MultiSelect, SearchInput, Section, SegmentedControl } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorRidesFilters() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">

				<SegmentedControl
					onChange={referencesEditorContext.filters.view_mode.set}
					value={referencesEditorContext.filters.view_mode.value}
					data={[
						{ label: `Ver todas as circulações (${referencesEditorContext.flags.isLoading ? 'Loading...' : referencesEditorContext.data.rides?.length ?? 0})`, value: 'all' },
						{ label: `Apenas as Selecionadas (${referencesEditorContext.data.selected_references.length ?? 0})`, value: 'selected' },
					]}
				/>

				{referencesEditorContext.filters.view_mode.value === 'all' && (
					<>
						<SearchInput onChange={referencesEditorContext.filters.search.set} value={referencesEditorContext.filters.search.value} />

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
					</>
				)}

			</Grid>
		</Section>
	);

	//
}
