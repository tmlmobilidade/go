'use client';

import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { Grid, MultiSelect, SearchField, Section, SegmentedControl } from '@tmlmobilidade/ui';

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
	// B. Render components

	return (
		<Section>
			<Grid columns="a" gap="md">

				<SegmentedControl
					onChange={setViewMode}
					value={viewMode}
					data={[
						{ label: `Ver todas as circulações`, value: 'all' },
						{ label: `Apenas as Selecionadas (${referencesEditorContext.data.selected_references.length ?? 0})`, value: 'selected' },
					]}
				/>

				{viewMode === 'all' && (
					<>
						<SearchField onChange={setSearchFilterValue} value={searchFilterValue} />

						<Grid columns="ab" gap="md">
							<MultiSelect
								data={[]}
								leftSection={<IconArrowLoopRight size={20} />}
								onChange={setLineIdsFilterValue}
								placeholder="Filtrar por linhas..."
								value={lineIdsFilterValue}
							/>
							<MultiSelect
								data={[]}
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
