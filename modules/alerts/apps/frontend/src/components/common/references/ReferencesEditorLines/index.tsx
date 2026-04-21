'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorLinesItem } from '@/components/common/references/ReferencesEditorLinesItem';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, NoDataLabel, Section, Surface } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorLines() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			{!referencesEditorContext.data.selected_references?.length && (
				<Surface>
					<Section alignItems="center">
						<NoDataLabel text="Nenhuma linha adicionada" />
					</Section>
				</Surface>
			)}

			{referencesEditorContext.data.selected_references.map((reference, index) => (
				<ReferencesEditorLinesItem
					key={index}
					index={index}
					lines={referencesEditorContext.data.filtered_lines}
					municipalityIds={[]}
					onRemoveReference={referencesEditorContext.actions.removeReference}
					onUpdateReference={referencesEditorContext.actions.updateReference}
					reference={reference}
					stops={stopsContext.data.stops}
				/>
			))}

			<Button
				icon={<IconPlus />}
				label="Adicionar Linha"
				onClick={referencesEditorContext.actions.addReference}
				variant="secondary"
			/>

		</Section>
	);

	//
}
