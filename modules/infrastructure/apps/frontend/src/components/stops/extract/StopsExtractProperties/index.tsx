'use client';

import { useStopsAgenciesData } from '@/components/stops/shared/use-stops-agencies-data';
import { useStopsLocationsData } from '@/components/stops/shared/use-stops-locations-data';
import { InfrastructureNodesV1ExtractionVersionValue, InfrastructureStopsV1ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { StopConnectionValues, StopFacilityValues } from '@tmlmobilidade/go-types-infrastructure';
import { LOCATION_PERMISSION_SLOTS } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { LifecycleStatusValues } from '@tmlmobilidade/go-types-shared';
import { Grid, MultiSelect, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsExtractFormContext } from '../StopsExtractForm.context';

/* * */

export function StopsExtractProperties() {
	//
	// A. Setup variables
	const { t } = useTranslation();
	const { capabilities, form } = useStopsExtractFormContext();
	const request = {
		permissions: { actions: [PermissionCatalog.all.stops.actions.export], scope: PermissionCatalog.all.stops.scope },
	};
	const { isLoading: agenciesLoading, options: agenciesOptions } = useStopsAgenciesData(request);
	const { isLoading: locationsLoading, options: locationsOptions } = useStopsLocationsData(request);
	const filters = [
		{
			data: agenciesOptions,
			isLoading: agenciesLoading,
			label: t('default:stops.extract.StopsExtractProperties.fields.agency_ids.label'),
			name: 'properties.agency_ids' as const,
		},
		...LOCATION_PERMISSION_SLOTS.map(slot => ({
			data: locationsOptions[slot],
			isLoading: locationsLoading,
			label: t(`default:stops.extract.StopsExtractProperties.fields.location_${slot}_ids.label`),
			name: `properties.location_${slot}_ids` as const,
		})),
		{
			data: locationsOptions.neighbourhood,
			isLoading: locationsLoading,
			label: t('default:stops.extract.StopsExtractProperties.fields.location_neighbourhood_ids.label'),
			name: 'properties.location_neighbourhood_ids' as const,
		},
		{
			data: LifecycleStatusValues.map(value => ({ label: t(`shared:status.lifecycle_status.${value}`), value })),
			isLoading: false,
			label: t('default:stops.extract.StopsExtractProperties.fields.lifecycle_statuses.label'),
			name: 'properties.lifecycle_statuses' as const,
		},
		{
			data: StopFacilityValues.map(value => ({ label: t(`default:stops.shared.stop_facility.${value}`), value })),
			isLoading: false,
			label: t('default:stops.extract.StopsExtractProperties.fields.facilities.label'),
			name: 'properties.facilities' as const,
		},
		{
			data: StopConnectionValues.map(value => ({ label: t(`default:stops.shared.stop_connection.${value}`), value })),
			isLoading: false,
			label: t('default:stops.extract.StopsExtractProperties.fields.connections.label'),
			name: 'properties.connections' as const,
		},
	];

	//
	// B. Render components

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
						label={t('default:stops.extract.StopsExtractProperties.fields.version.label')}
						onChange={field.onChange}
						value={field.value}
						data={[
							{ label: t('shared:extractions.versions.infrastructure-stops-v1.title'), value: InfrastructureStopsV1ExtractionVersionValue },
							{ label: t('shared:extractions.versions.infrastructure-nodes-v1.title'), value: InfrastructureNodesV1ExtractionVersionValue },
						]}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="properties.search"
				render={({ field, fieldState }) => (
					<TextInput
						disabled={!capabilities?.editEnabled}
						error={fieldState.error?.message}
						label={t('default:stops.extract.StopsExtractProperties.fields.search.label')}
						onChange={field.onChange}
						placeholder={t('default:stops.extract.StopsExtractProperties.fields.search.placeholder')}
						value={field.value ?? ''}
					/>
				)}
			/>
			<Grid columns="ab" gap="md">
				{filters.map(filter => (
					<StandardFormController
						key={filter.name}
						control={form.control}
						name={filter.name}
						render={({ field, fieldState }) => (
							<MultiSelect
								data={filter.data}
								disabled={!capabilities?.editEnabled || filter.isLoading}
								error={fieldState.error?.message}
								label={filter.label}
								onChange={field.onChange}
								placeholder={t('default:stops.extract.StopsExtractProperties.placeholder')}
								value={field.value ?? []}
								w="100%"
							/>
						)}
					/>
				))}
			</Grid>
		</Section>
	);
}
