'use client';

import { useStopsAgenciesData } from '@/components/stops/shared/use-stops-agencies-data';
import { useStopsLocationsData } from '@/components/stops/shared/use-stops-locations-data';
import { CoordinatesInput, Grid, MultiSelect, Section, StandardFormController, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsExtractV1FormContext } from '../StopsExtractV1Form.context';

/* * */

export function StopsExtractV1Properties() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useStopsExtractV1FormContext();
	const coordinates = useStandardFormWatch({ control: form.control, name: 'coordinates' });

	const { options: agenciesOptions } = useStopsAgenciesData({ permissions: { actions: ['read'], scope: 'stops' } });
	const { isLoading: locationsLoading, options: locationsOptions } = useStopsLocationsData({ permissions: { actions: ['read'], scope: 'stops' } });

	//
	// B. Render components

	return (
		<Section gap="md">

			{coordinates && (
				<CoordinatesInput
					disabled={!capabilities.editEnabled}
					label={t('stops:extract.StopsExtractV1Properties.fields.coordinates.label')}
					onChange={value => form.setValue('coordinates', value ? [value[1], value[0]] : undefined, { shouldDirty: true, shouldValidate: true })}
					value={[coordinates[1], coordinates[0]]}
				/>
			)}

			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={agenciesOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('stops:extract.StopsExtractV1Properties.fields.agency_ids.label')}
						onChange={field.onChange}
						placeholder={t('stops:extract.StopsExtractV1Properties.fields.agency_ids.placeholder')}
						value={field.value ?? []}
						w="100%"
						withAsterisk
					/>
				)}
			/>

			<Grid columns="ab" gap="md">

				<StandardFormController
					control={form.control}
					name="location_primary_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={locationsOptions.primary}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('stops:extract.StopsExtractV1Properties.fields.location_primary_ids.label')}
							loading={locationsLoading}
							onChange={field.onChange}
							placeholder={t('stops:extract.StopsExtractV1Properties.fields.location_primary_ids.placeholder')}
							value={field.value ?? []}
							w="100%"
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="location_secondary_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={locationsOptions.secondary}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('stops:extract.StopsExtractV1Properties.fields.location_secondary_ids.label')}
							loading={locationsLoading}
							onChange={field.onChange}
							placeholder={t('stops:extract.StopsExtractV1Properties.fields.location_secondary_ids.placeholder')}
							value={field.value ?? []}
							w="100%"
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="location_tertiary_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={locationsOptions.tertiary}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('stops:extract.StopsExtractV1Properties.fields.location_tertiary_ids.label')}
							loading={locationsLoading}
							onChange={field.onChange}
							placeholder={t('stops:extract.StopsExtractV1Properties.fields.location_tertiary_ids.placeholder')}
							value={field.value ?? []}
							w="100%"
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="location_neighbourhood_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={locationsOptions.neighbourhood}
							disabled={!capabilities?.editEnabled}
							error={fieldState.error?.message}
							label={t('stops:extract.StopsExtractV1Properties.fields.location_neighbourhood_ids.label')}
							loading={locationsLoading}
							onChange={field.onChange}
							placeholder={t('stops:extract.StopsExtractV1Properties.fields.location_neighbourhood_ids.placeholder')}
							value={field.value ?? []}
							w="100%"
						/>
					)}
				/>

			</Grid>

		</Section>
	);
}
