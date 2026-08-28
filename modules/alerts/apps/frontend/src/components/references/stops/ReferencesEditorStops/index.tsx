'use client';

import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { ReferencesEditorStopsItem } from '@/components/references/stops/ReferencesEditorStopsItem';
import { IconPlus } from '@tabler/icons-react';
import { Button, LoadingSection, NoDataLabel, Section, Surface } from '@tmlmobilidade/ui';

import { useAlertsStopsData } from '../use-alerts-stops-data';

/* * */

export function ReferencesEditorStops() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	const { isLoading: alertsStopsLoading } = useAlertsStopsData();

	//
	// B. Render components

	if (alertsStopsLoading) {
		return <LoadingSection />;
	}

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
					onRemoveReference={referencesEditorContext.actions.removeReference}
					onUpdateReference={referencesEditorContext.actions.updateReference}
					reference={reference}
				/>
			))}

			{!referencesEditorContext.flags.isReadonly && (
				<Button
					icon={<IconPlus />}
					label="Adicionar Paragem"
					onClick={referencesEditorContext.actions.addReference}
					variant="secondary"
				/>
			)}

		</Section>
	);

	//
}
