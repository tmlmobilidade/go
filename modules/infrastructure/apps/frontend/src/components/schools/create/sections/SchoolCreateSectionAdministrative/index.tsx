'use client';

import { useSchoolsCreateFormContext } from '@/components/schools/create/shared/SchoolsCreateForm.context';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput, useLocationsContext } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionAdministrative() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { form } = useSchoolsCreateFormContext();
	const locationsContext = useLocationsContext();

	//
	// B. Transform data

	const municipalitiesData = useMemo(() => Array.from(locationsContext.data.municipalities.values()), [locationsContext.data.municipalities]);

	const municipalityOptions = useMemo(() => municipalitiesData
		.map(item => ({ label: item.name, value: item._id }))
		.sort((a, b) => a.label.localeCompare(b.label, 'pt')), [municipalitiesData]);

	//
	// C. Handle actions

	const handleMunicipalityChange = (value: null | string, fieldOnChange: (value: string) => void) => {
		const municipality = value ? municipalitiesData?.find(item => item._id === value) : undefined;
		const district = municipality ? locationsContext.actions.getDistrict(municipality.district_id) : undefined;

		fieldOnChange(value ?? '');
		form.setValue('municipality_name', municipality?.name ?? '', { shouldDirty: true });
		form.setValue('district_id', district?._id ?? '', { shouldDirty: true });
		form.setValue('district_name', district?.name ?? '', { shouldDirty: true });
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
					<StandardFormController
						control={form.control}
						name="municipality_id"
						render={({ field, fieldState }) => (
							<Select
								data={municipalityOptions}
								disabled={locationsContext.flags.is_loading}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionAdministrative.fields.municipality_name.label')}
								onBlur={field.onBlur}
								onChange={value => handleMunicipalityChange(value, field.onChange)}
								placeholder={t('schools:create.SchoolCreateSectionAdministrative.fields.municipality_name.placeholder')}
								value={field.value}
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="district_name"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name.label')}
								placeholder={t('schools:create.SchoolCreateSectionAdministrative.fields.district_name.placeholder')}
								value={field.value ?? ''}
								readOnly
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
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
