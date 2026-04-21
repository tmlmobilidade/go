'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorStopsItem } from '@/components/common/references/ReferencesEditorStopsItem';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, NoDataLabel, Section, Surface } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorStops() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Render components

	return (
		<Section gap="md">

			{!referencesEditorContext.data.selected_references?.length && (
				<Surface>
					<Section alignItems="center">
						<NoDataLabel text="Nenhuma paragem adicionada" />
					</Section>
				</Surface>
			)}

			{referencesEditorContext.data.selected_references.map((reference, index) => (
				<ReferencesEditorStopsItem
					key={index}
					index={index}
					lines={linesContext.data.lines}
					municipalityIds={[]}
					onRemoveReference={referencesEditorContext.actions.removeReference}
					onUpdateReference={referencesEditorContext.actions.updateReference}
					reference={reference}
					stops={stopsContext.data.stops}
				/>
			))}

			<Button
				icon={<IconPlus />}
				label="Adicionar Paragem"
				onClick={referencesEditorContext.actions.addReference}
				variant="secondary"
			/>

		</Section>
	);

	//
}
