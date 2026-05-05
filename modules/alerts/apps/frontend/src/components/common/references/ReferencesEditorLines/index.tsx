'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { ReferencesEditorLinesItem } from '@/components/common/references/ReferencesEditorLinesItem';
import { IconPlus } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Button, LoadingSection, NoDataLabel, Section, Surface, useDataOperationalLines } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorLines() {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Fetch data

	const { isLoading: operationalLinesLoading } = useDataOperationalLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: [referencesEditorContext.data.selected_agency_id],
			date_end: referencesEditorContext.data.active_period_end_date,
			date_start: referencesEditorContext.data.active_period_start_date,
		},
	});

	//
	// C. Render components

	if (operationalLinesLoading) {
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
