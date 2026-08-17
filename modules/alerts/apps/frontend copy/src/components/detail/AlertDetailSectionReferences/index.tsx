'use client';

import { ReferencesEditor } from '@/components/common/references/ReferencesEditor';
import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, AlertReferenceTypeValues, PermissionCatalog } from '@tmlmobilidade/types';
import { Collapsible, ContextFormController, Label, openConfirmModal, Section, Select, useContextFormWatch, useDataAgencies, useMeContext } from '@tmlmobilidade/ui';
import { useCallback, useMemo } from 'react';

/* * */

export function AlertDetailSectionReferences() {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();
	const alertDetailContext = useAlertDetailContext();

	const agencyIdValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'agency_id' });
	const causeValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'cause' });
	const effectValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'effect' });
	const municipalityIdsValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'municipality_ids' });
	const activePeriodStartDateValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'active_period_start_date' });
	const activePeriodEndDateValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'active_period_end_date' });
	const referenceTypeValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'reference_type' });
	const referencesValue = useContextFormWatch({ control: alertDetailContext.form.instance.control, name: 'references' });

	//
	// B. Fetch data

	const { filtered: agenciesData, options: agenciesOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.alerts.actions.read, PermissionCatalog.all.alerts.actions.update],
		scope: PermissionCatalog.all.alerts.scope,
	});

	//
	// C. Transform data

	const preparedOptions = useMemo(() => {
		// Find the agency data that matches the selected agency_id in the form.
		const matchingAgencyData = agenciesData?.find(item => item._id === agencyIdValue);
		if (!matchingAgencyData) return [];
		// Only show effects that have at least one reference_type enabled (cause > effect > reference_type = true).
		// Map to the format needed for rendering the buttons
		// and sort alphabetically by label.
		return AlertReferenceTypeValues
			.filter(referenceTypeValue => !!matchingAgencyData.alerts_map?.[causeValue]?.[effectValue]?.[referenceTypeValue])
			.sort((a, b) => a.localeCompare(b));
	}, [agenciesData, agencyIdValue, causeValue, effectValue]);

	const hasPermissionToEdit = meContext.actions.hasPermissionResource([
		{
			action: PermissionCatalog.all.alerts.actions.update,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.agency_id,
		},
		{
			action: PermissionCatalog.all.alerts.actions.update,
			resource_key: 'reference_types',
			scope: PermissionCatalog.all.alerts.scope,
			value: alertDetailContext.data.alert.reference_type,
		},
	]);

	//
	// D. Handle actions

	const handleChangeAgencyId = (value: Alert['agency_id'], fieldOnChange: (v: Alert['agency_id']) => void) => {
		if (alertDetailContext.form.instance.getValues('references')?.length > 0) {
			openConfirmModal({
				cancelProps: { variant: 'danger' },
				centered: true,
				children: <Label>Ao alterar o operador, irá perder as referências que já foram adicionadas.</Label>,
				closeOnClickOutside: true,
				labels: { cancel: 'Cancelar', confirm: 'Continuar' },
				onConfirm: () => {
					fieldOnChange(value);
					alertDetailContext.form.instance.setValue('references', [], { shouldDirty: true });
				},
				title: 'Tem a certeza que pretende mudar de operador?',
			});
		} else {
			fieldOnChange(value);
			alertDetailContext.form.instance.setValue('references', [], { shouldDirty: true });
		}
	};

	const handleChangeReferenceType = useCallback((value: Alert['reference_type']) => {
		alertDetailContext.form.instance.setValue('reference_type', value, { shouldDirty: true });
	}, [alertDetailContext.form.instance]);

	const handleChangeReferences = useCallback((references: Alert['references']) => {
		alertDetailContext.form.instance.setValue('references', references, { shouldDirty: true });
	}, [alertDetailContext.form.instance]);

	//
	// E. Render components

	return (
		<Collapsible
			description="As referências (Linhas, Paragens, Municípios, Etc...) afetadas por este alerta."
			title="Referências"
			defaultOpen
		>

			{agenciesOptions.length > 1 && (
				<Section>
					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="agency_id"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								data={agenciesOptions}
								error={fieldState.error?.message}
								label="Operador afetado"
								onBlur={field.onBlur}
								onChange={value => handleChangeAgencyId(value, field.onChange)}
								value={field.value}
							/>
						)}
					/>
				</Section>
			)}

			<ReferencesEditor
				activePeriodEndDate={activePeriodEndDateValue}
				activePeriodStartDate={activePeriodStartDateValue}
				enabledReferenceTypes={preparedOptions}
				onChangeReferences={handleChangeReferences}
				onChangeReferenceType={handleChangeReferenceType}
				readonly={!hasPermissionToEdit}
				selectedAgencyId={agencyIdValue}
				selectedMunicipalityIds={municipalityIdsValue}
				selectedReferences={referencesValue}
				selectedReferenceType={referenceTypeValue}
			/>

		</Collapsible>
	);
}
