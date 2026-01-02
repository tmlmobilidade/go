'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { Button, Grid, Section, SegmentedControl } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorRidesSelectionControls() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section padding="none">
			<Grid columns="ab" gap="md">
				<SegmentedControl
					onChange={referencesEditorContext.filters.view_mode.set}
					value={referencesEditorContext.filters.view_mode.value}
					data={[
						{ label: `Ver todas as circulações (${referencesEditorContext.data.filtered_rides?.length ?? 0})`, value: 'all' },
						{ label: `Apenas as Selecionadas (${referencesEditorContext.data.selected_references.length ?? 0})`, value: 'selected' },
					]}
				/>
				<Button
					disabled={referencesEditorContext.data.selected_references.length === 0}
					label="Remover Seleção"
					onClick={referencesEditorContext.actions.removeAllRides}
					variant="danger"
				/>
			</Grid>
		</Section>
	);

	//
}
