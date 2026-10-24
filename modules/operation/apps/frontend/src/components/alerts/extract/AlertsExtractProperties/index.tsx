'use client';

import { OperationAlertsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { AlertCauseValues, AlertEffectValues, type AlertReferenceType, AlertReferenceTypeValues } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { PublishStatusValues } from '@tmlmobilidade/go-types-shared';
import { DateTimeInput, Grid, MultiSelect, Section, Select, StandardFormController, TextInput, useMeData } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useAlertsAgenciesData } from '../../shared/use-alerts-agencies-data';
import { useAlertsExtractFormContext } from '../AlertsExtractForm.context';

/* * */

export function AlertsExtractProperties() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAlertsExtractFormContext();
	const { data: meData } = useMeData();
	const { isLoading: agenciesLoading, options: agenciesOptions } = useAlertsAgenciesData({
		permissions: { actions: [PermissionCatalog.all.alerts.actions.read], scope: PermissionCatalog.all.alerts.scope },
	});

	//
	// B. Prepare the available filters

	const permittedReferenceTypes = filterPermissionResourceValues<AlertReferenceType>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: meData?.permissions,
		resourceKey: 'reference_types',
		scope: PermissionCatalog.all.alerts.scope,
		values: [...AlertReferenceTypeValues],
	});

	const selectionFields = [
		{
			data: agenciesOptions,
			isLoading: agenciesLoading,
			label: t('alerts:extract.AlertsExtractProperties.fields.agency_ids.label'),
			name: 'properties.agency_ids' as const,
		},
		{
			data: PublishStatusValues.map(value => ({ label: t(`shared:status.publish_status.${value}`), value })),
			label: t('alerts:extract.AlertsExtractProperties.fields.publish_status.label'),
			name: 'properties.publish_status' as const,
		},
		{
			data: permittedReferenceTypes.map(value => ({ label: t(`reference_types:${value}`), value })),
			label: t('alerts:extract.AlertsExtractProperties.fields.reference_type.label'),
			name: 'properties.reference_type' as const,
		},
		{
			data: AlertCauseValues.map(value => ({ label: t(`causes:${value}`), value })),
			label: t('alerts:extract.AlertsExtractProperties.fields.causes.label'),
			name: 'properties.causes' as const,
		},
		{
			data: AlertEffectValues.map(value => ({ label: t(`effects:${value}`), value })),
			label: t('alerts:extract.AlertsExtractProperties.fields.effects.label'),
			name: 'properties.effects' as const,
		},
	];

	const dateFields = [
		{ label: t('alerts:extract.AlertsExtractProperties.fields.publish_date_filter_start.label'), name: 'properties.publish_date_filter_start' as const, optional: false },
		{ label: t('alerts:extract.AlertsExtractProperties.fields.publish_date_filter_end.label'), name: 'properties.publish_date_filter_end' as const, optional: false },
		{ label: t('alerts:extract.AlertsExtractProperties.fields.active_period_filter_start.label'), name: 'properties.active_period_filter_start' as const, optional: true },
		{ label: t('alerts:extract.AlertsExtractProperties.fields.active_period_filter_end.label'), name: 'properties.active_period_filter_end' as const, optional: true },
	];

	//
	// C. Render components

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="version"
				render={({ field, fieldState }) => (
					<Select
						clearable={false}
						disabled={!capabilities?.editEnabled}
						error={fieldState.error?.message}
						label={t('alerts:extract.AlertsExtractProperties.fields.version.label')}
						onChange={field.onChange}
						value={field.value}
						data={[
							{ label: t('shared:extractions.versions.operation-alerts-v1.title'), value: OperationAlertsV1ExtractionVersionValue },
						]}
					/>
				)}
			/>
			<Grid columns="ab" gap="md">
				{selectionFields.map(selectionField => (
					<StandardFormController
						key={selectionField.name}
						control={form.control}
						name={selectionField.name}
						render={({ field, fieldState }) => {
							const selectedValues: string[] = field.value ?? [];
							const hasAvailableOptions = selectionField.data.length > 0;
							const hasSameNumberOfSelectedOptions = selectionField.data.length === selectedValues.length;
							const areAllOptionsSelected =
								hasAvailableOptions
								&& hasSameNumberOfSelectedOptions
								&& selectionField.data.every(option => selectedValues.includes(option.value));

							// Show all selected options as "No filter", keeping the explicit values in the form.
							return (
								<MultiSelect
									classNames={{ pillsList: styles.selectedFilters }}
									data={selectionField.data}
									disabled={!capabilities?.editEnabled || selectionField.isLoading}
									error={fieldState.error?.message}
									label={selectionField.label}
									onChange={field.onChange}
									placeholder={areAllOptionsSelected ? t('alerts:extract.AlertsExtractProperties.no_filter') : t('alerts:extract.AlertsExtractProperties.placeholder')}
									value={areAllOptionsSelected ? [] : selectedValues}
									w="100%"
									withAsterisk
								/>
							);
						}}
					/>
				))}
				<StandardFormController
					control={form.control}
					name="properties.search"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('alerts:extract.AlertsExtractProperties.fields.search.label')}
							onChange={field.onChange}
							value={field.value ?? ''}
						/>
					)}
				/>
			</Grid>
			<Grid columns="ab" gap="md">
				{dateFields.map(dateField => (
					<StandardFormController
						key={dateField.name}
						control={form.control}
						name={dateField.name}
						render={({ field, fieldState }) => (
							<DateTimeInput
								clearable={dateField.optional}
								disabled={!capabilities?.editEnabled}
								error={fieldState.error?.message}
								label={dateField.label}
								onChange={value => field.onChange(value ?? undefined)}
								placeholder={t('alerts:extract.AlertsExtractProperties.date_placeholder')}
								value={form.getValues(dateField.name) ?? null}
							/>
						)}
					/>
				))}
			</Grid>
		</Section>
	);
}
