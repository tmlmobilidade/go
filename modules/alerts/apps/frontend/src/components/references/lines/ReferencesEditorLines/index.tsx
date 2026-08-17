'use client';

import { ReferencesEditorLinesItem } from '@/components/references/lines/ReferencesEditorLinesItem';
import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, LoadingSection, NoDataLabel, Section, Surface } from '@tmlmobilidade/ui';

import { useAlertsLinesData } from '../use-alerts-lines-data';

/* * */

export function ReferencesEditorLines() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Fetch data

	const { isLoading: alertsLinesLoading } = useAlertsLinesData();

	//
	// C. Render components

	if (alertsLinesLoading) {
		return <LoadingSection />;
	}

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
					onRemoveReference={referencesEditorContext.actions.removeReference}
					onUpdateReference={referencesEditorContext.actions.updateReference}
					reference={reference}
				/>
			))}

			{!referencesEditorContext.flags.isReadonly && (
				<Button
					icon={<IconPlus />}
					label="Adicionar Linha"
					onClick={referencesEditorContext.actions.addReference}
					variant="secondary"
				/>
			)}

		</Section>
	);

	//
}
