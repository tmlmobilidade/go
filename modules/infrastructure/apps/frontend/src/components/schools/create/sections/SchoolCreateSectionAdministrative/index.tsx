'use client';

import { useSchoolsCreateFormContext } from '@/components/schools/create/shared/SchoolsCreateForm.context';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput, useLocationsContext, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionAdministrative() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();
	const locationsContext = useLocationsContext();

	const districtIdValue = useStandardFormWatch({ control: schoolsCreateForm.control, name: 'district_id' });
	const municipalityIdValue = useStandardFormWatch({ control: schoolsCreateForm.control, name: 'municipality_id' });

	//
	// B. Transform data

	const districtsData = useMemo(() => Array.from(locationsContext.data.districts.values()), [locationsContext.data.districts]);
	const municipalitiesData = useMemo(() => Array.from(locationsContext.data.municipalities.values()), [locationsContext.data.municipalities]);

	const districtOptions = useMemo(() => districtsData
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [districtsData]);

	const municipalityOptions = useMemo(() => municipalitiesData
		.filter(item => !districtIdValue || item.district_id === districtIdValue)
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [districtIdValue, municipalitiesData]);

	//
	// C. Handle actions

	const handleDistrictChange = (value: null | string) => {
		const district = value ? districtsData?.find(item => item._id === value) : undefined;
		schoolsCreateForm.setValue('district_id', value ?? '', { shouldDirty: true });
		schoolsCreateForm.setValue('district_name', district?.name ?? '', { shouldDirty: true });
		schoolsCreateForm.setValue('municipality_id', '', { shouldDirty: true });
		schoolsCreateForm.setValue('municipality_name', '', { shouldDirty: true });
	};

	const handleMunicipalityChange = (value: null | string) => {
		const municipality = value ? municipalitiesData?.find(item => item._id === value) : undefined;
		const district = municipality ? districtsData?.find(item => item._id === municipality.district_id) : undefined;

		schoolsCreateForm.setValue('municipality_id', value ?? '', { shouldDirty: true });
		schoolsCreateForm.setValue('municipality_name', municipality?.name ?? '', { shouldDirty: true });

		if (!district) return;
		schoolsCreateForm.setValue('district_id', district._id, { shouldDirty: true });
		schoolsCreateForm.setValue('district_name', district.name, { shouldDirty: true });
	};

	// IDs stay in form state; users select names only.
	// Region has no locations endpoint yet, so region_id remains backend-populated.

	//
	// D. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionAdministrative.description')}
			title={t('schools:create.SchoolCreateSectionAdministrative.title')}
		>
			<Section gap="sm">
				<Grid columns="ab" gap="md">
					<Select
						data={districtOptions}
						disabled={locationsContext.flags.is_loading}
						label={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name.label')}
						name="district_id"
						onChange={handleDistrictChange}
						placeholder={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name.placeholder')}
						value={districtIdValue}
					/>

					<Select
						data={municipalityOptions}
						disabled={locationsContext.flags.is_loading}
						label={t('schools:create.SchoolCreateSectionAdministrative.fields.municipality_name.label')}
						name="municipality_id"
						onChange={handleMunicipalityChange}
						placeholder={t('schools:create.SchoolCreateSectionAdministrative.fields.municipality_name.placeholder')}
						value={municipalityIdValue}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="region_name"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionAdministrative.fields.region_name.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionAdministrative.fields.region_name.placeholder')}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
