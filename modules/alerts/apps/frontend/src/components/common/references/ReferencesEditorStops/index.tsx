'use client';

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorStopsItem } from '@/components/common/references/ReferencesEditorStopsItem';
import { IconPlus } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Button, LoadingSection, NoDataLabel, Section, Surface, useDataOperationalStops } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorStops() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Fetch data

	const { isLoading: operationalStopsLoading } = useDataOperationalStops(API_ROUTES.alerts.OPERATION_STOPS, {
		filters: {
			agency_ids: [referencesEditorContext.data.selected_agency_id],
			date_end: referencesEditorContext.data.active_period_end_date,
			date_start: referencesEditorContext.data.active_period_start_date,
		},
	});

	//
	// C. Render components

	if (operationalStopsLoading) {
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
