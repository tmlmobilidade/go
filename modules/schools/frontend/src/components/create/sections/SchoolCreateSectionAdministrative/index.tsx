'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { Collapsible, fetchApiData, Grid, Section, Select, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

interface SchoolDistrict {
	_id: string
	name: string
}

interface SchoolMunicipality {
	_id: string
	district_id: string
	name: string
}

/* * */

export function SchoolCreateSectionAdministrative() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	const districtIdValue = useStandardFormWatch({ control: schoolsCreateForm.control, name: 'district_id' });
	const municipalityIdValue = useStandardFormWatch({ control: schoolsCreateForm.control, name: 'municipality_id' });

	//
	// B. Transform data

	const { data: districtsResponse, isLoading: districtsLoading } = useSWR<ApiResponse<SchoolDistrict[]>>(API_ROUTES.locations.LOCATIONS_DISTRICTS, {
		fetcher: async (url: string) => await fetchApiData<SchoolDistrict[]>({ url }),
	});

	const { data: municipalitiesResponse, isLoading: municipalitiesLoading } = useSWR<ApiResponse<SchoolMunicipality[]>>(API_ROUTES.locations.LOCATIONS_MUNICIPALITIES, {
		fetcher: async (url: string) => await fetchApiData<SchoolMunicipality[]>({ url }),
	});

	const districtsData = districtsResponse?.data;
	const municipalitiesData = municipalitiesResponse?.data;

	const districtOptions = useMemo(() => (districtsData ?? [])
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label)), [districtsData]);

	const municipalityOptions = useMemo(() => (municipalitiesData ?? [])
		.filter(item => !districtIdValue || item.district_id === districtIdValue)
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label)), [districtIdValue, municipalitiesData]);

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
						disabled={districtsLoading || municipalitiesLoading}
						label={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name')}
						name="district_id"
						onChange={handleDistrictChange}
						value={districtIdValue}
					/>

					<Select
						data={municipalityOptions}
						disabled={districtsLoading || municipalitiesLoading}
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
