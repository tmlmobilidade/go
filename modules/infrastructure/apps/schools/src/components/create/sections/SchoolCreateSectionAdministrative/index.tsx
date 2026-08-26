'use client';

import { Collapsible, Grid, Section, Select, StandardFormController, TextInput, useLocationsContext, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

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

	const districtOptions = useMemo(() => Array.from(locationsContext.data.districts.values())
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [locationsContext.data.districts]);

	const municipalityOptions = useMemo(() => Array.from(locationsContext.data.municipalities.values())
		.filter(item => !districtIdValue || item.district_id === districtIdValue)
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [districtIdValue, locationsContext.data.municipalities]);

	//
	// C. Handle actions

	const handleDistrictChange = (value: null | string) => {
		const district = value ? locationsContext.actions.getDistrict(value) : undefined;
		schoolsCreateForm.setValue('district_id', value ?? '', { shouldDirty: true });
		schoolsCreateForm.setValue('district_name', district?.name ?? '', { shouldDirty: true });
		schoolsCreateForm.setValue('municipality_id', '', { shouldDirty: true });
		schoolsCreateForm.setValue('municipality_name', '', { shouldDirty: true });
	};

	const handleMunicipalityChange = (value: null | string) => {
		const municipality = value ? locationsContext.actions.getMunicipality(value) : undefined;
		const district = municipality ? locationsContext.actions.getDistrict(municipality.district_id) : undefined;

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
						label={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name')}
						name="district_id"
						onChange={handleDistrictChange}
						value={districtIdValue}
					/>

					<Select
						data={municipalityOptions}
						disabled={locationsContext.flags.is_loading}
						label={t('schools:create.SchoolCreateSectionAdministrative.fields.municipality_name')}
						name="municipality_id"
						onChange={handleMunicipalityChange}
						value={municipalityIdValue}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="region_name"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionAdministrative.fields.region_name')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
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
