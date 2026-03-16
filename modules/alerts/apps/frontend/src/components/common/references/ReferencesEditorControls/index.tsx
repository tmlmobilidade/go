'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { AlertReferenceTypeSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Divider, Grid, Section, SegmentedControl, Select, useMeContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
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

	const sortedAvailableAgenciesOptions = useMemo(() => {
		const arr = referencesEditorContext.data.available_agencies_options || [];
		return [...arr].sort((a, b) => {
			const getLabelText = (label = '') => {
				const idx = label.indexOf(' - ');
				return (idx >= 0 ? label.slice(idx + 3) : label).trim().toLowerCase();
			};

			const la = getLabelText(a.label);
			const lb = getLabelText(b.label);
			if (la === lb) return (a.label || '').localeCompare(b.label || '');
			return la.localeCompare(lb);
		});
	}, [referencesEditorContext.data.available_agencies_options]);

	if (sortedAvailableAgenciesOptions.length <= 1 && availableReferenceTypeOptions.length <= 1) {
		return;
	}

	return (
		<>

			<Section>
				<Grid gap="md">
					{sortedAvailableAgenciesOptions.length > 1 && (
						<Select
							data={sortedAvailableAgenciesOptions}
							label="Operador afetado"
							onChange={referencesEditorContext.actions.changeAgencyId}
							value={referencesEditorContext.data.selected_agency_id}
						/>
					)}
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
