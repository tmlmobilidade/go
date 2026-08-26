'use client';

import { School } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, Grid, LoadingSection, Section, Select, StandardFormController, TextInput, useAgenciesData, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	const agencyIdValue = useStandardFormWatch({ control: schoolsCreateForm.control, name: 'agency_id' });

	//
	// B. Fetch data

	const { data: agenciesData, isLoading: agenciesLoading } = useAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.schools.actions.create],
			scope: PermissionCatalog.all.schools.scope,
		},
	});

	//
	// C. Transform data

	const handleSelectAgencyId = (value: School['agency_id']) => {
		schoolsCreateForm.setValue('agency_id', value, { shouldDirty: true });
	};

	//
	// D. Render components

	if (agenciesLoading) {
		return <LoadingSection />;
	}

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOrganization.description')}
			title={t('schools:create.SchoolCreateSectionOrganization.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">
					<Select
						data={agenciesData?.map(agency => ({ label: agency.name, value: agency._id }))}
						label={t('schools:create.SchoolCreateSectionGeneral.agency')}
						name="agency_id"
						onChange={value => handleSelectAgencyId(value as School['agency_id'])}
						value={agencyIdValue}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.email')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="url"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionOrganization.fields.url')}
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
