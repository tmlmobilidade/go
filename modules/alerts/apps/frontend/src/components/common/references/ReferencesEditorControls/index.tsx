'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { AlertReferenceTypeSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Divider, Grid, Section, SegmentedControl, useMeContext } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ReferencesEditorControls() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const meContext = useMeContext();
	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const availableReferenceTypeOptions = AlertReferenceTypeSchema.options
		.filter(value => referencesEditorContext.data.enabled_reference_types.includes(value))
		.filter(value => meContext.actions.hasPermissionResource({
			action: PermissionCatalog.all.alerts.actions.create,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: value,
		}))
		.map(value => ({ label: t(`shared:alerts.reference_types.${value}.title`), value }));

	//
	// C. Render components

	return (
		<>

			<Section>
				<Grid gap="md">
					{referencesEditorContext.data.selected_agency_id && availableReferenceTypeOptions.length > 1 && (
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
