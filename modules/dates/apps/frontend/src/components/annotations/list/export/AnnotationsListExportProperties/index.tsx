'use client';

import { AnnotationCategoryValues } from '@tmlmobilidade/go-types-dates';
import { DatesAnnotationsV1WithoutAgencyValue, DatesAnnotationsV1WithoutCategoryValue, DatesAnnotationsV1WithoutLocationValue } from '@tmlmobilidade/go-types-extractions';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, ErrorDisplay, LocationsSelect, MultiSelect, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsAgenciesData } from '../../../shared/use-annotations-agencies-data';
import { useAnnotationsLocationsData } from '../../../shared/use-annotations-locations-data';
import { useAnnotationsListExportFormContext } from '../AnnotationsListExport/AnnotationsListExportForm.context';
import { AnnotationsListExportDates } from '../AnnotationsListExportDates';

/* * */

export function AnnotationsListExportProperties() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAnnotationsListExportFormContext();
	const agencies = useAnnotationsAgenciesData({ permissions: { actions: [PermissionCatalog.all.annotations.actions.read], scope: PermissionCatalog.all.annotations.scope } });
	const locations = useAnnotationsLocationsData();
	const agencyOptions = [{ label: t('default:annotations.fields.agency_ids.unassigned'), value: DatesAnnotationsV1WithoutAgencyValue }, ...agencies.options];
	const categoryOptions = [
		{ label: t('annotations:categories.uncategorized'), value: DatesAnnotationsV1WithoutCategoryValue },
		...AnnotationCategoryValues.map(value => ({ label: t(`annotations:categories.values.${value}`), value })),
	];
	const locationOptions = [{ label: t('annotations:list.AnnotationsListFilterLocations.empty'), value: DatesAnnotationsV1WithoutLocationValue }];

	//
	// B. Render components

	return (
		<Section gap="md">
			{agencies.error && <ErrorDisplay message={agencies.error} />}
			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={agencyOptions}
						disabled={!capabilities.editEnabled || agencies.isLoading}
						error={fieldState.error?.message}
						label={t('annotations:list.AnnotationsListExportProperties.operators')}
						onChange={field.onChange}
						placeholder={t('annotations:list.AnnotationsListExportProperties.all_operators')}
						value={field.value ?? []}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="categories"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={categoryOptions}
						disabled={!capabilities.editEnabled}
						error={fieldState.error?.message}
						label={t('annotations:list.AnnotationsListExportProperties.categories')}
						onChange={field.onChange}
						placeholder={t('annotations:list.AnnotationsListExportProperties.all_categories')}
						value={field.value ?? []}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="location_ids"
				render={({ field, fieldState }) => (
					<LocationsSelect
						additionalOptions={locationOptions}
						disabled={!capabilities.editEnabled || locations.isLoading}
						error={fieldState.error?.message ?? (locations.error ? t('annotations:AnnotationsLocationsSelect.load_error') : undefined)}
						label={t('annotations:list.AnnotationsListExportProperties.locations')}
						onChange={field.onChange}
						placeholder={t('annotations:list.AnnotationsListExportProperties.all_locations')}
						tree={locations.tree}
						value={field.value ?? []}
						clearable
						groups
					/>
				)}
			/>
			{locations.error && <Button label={t('annotations:AnnotationsLocationsSelect.retry')} loading={locations.isValidating} onClick={() => locations.mutate()} size="xs" variant="transparent" />}
			<AnnotationsListExportDates />
		</Section>
	);
}
