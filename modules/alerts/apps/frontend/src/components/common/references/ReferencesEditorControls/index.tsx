'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { AlertReferenceTypeSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Divider, Grid, Section, SegmentedControl, Select, useMeContext } from '@tmlmobilidade/ui';

/* * */

export function ReferencesEditorControls() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const availableReferenceTypeOptions = AlertReferenceTypeSchema.options
		.filter(value => meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: value,
		}))
		.map((value) => {
			switch (value) {
				case 'agency':
					return { label: 'Operador', value };
				case 'lines':
					return { label: 'Linhas', value };
				case 'rides':
					return { label: 'Circulações', value };
				case 'stops':
					return { label: 'Paragens', value };
			}
		});

	//
	// C. Render components

	if (referencesEditorContext.data.available_agencies_options.length <= 1 && availableReferenceTypeOptions.length <= 1) {
		return;
	}

	return (
		<>

			<Section>
				<Grid gap="md">
					{referencesEditorContext.data.available_agencies_options.length > 1 && (
						<Select
							data={referencesEditorContext.data.available_agencies_options}
							label="Operador afetado"
							onChange={referencesEditorContext.actions.changeAgencyId}
							value={referencesEditorContext.data.selected_agency_id}
						/>
					)}
					{availableReferenceTypeOptions.length > 1 && (
						<SegmentedControl
							data={availableReferenceTypeOptions}
							onChange={referencesEditorContext.actions.changeReferenceType}
							value={referencesEditorContext.data.selected_reference_type}
							fullWidth
						/>
					)}

				</Grid>
			</Section>

			<Divider lineStyle="dashed" />

		</>
	);
}
