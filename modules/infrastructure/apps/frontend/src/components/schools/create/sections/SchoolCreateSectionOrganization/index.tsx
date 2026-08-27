'use client';

import { useSchoolsAgenciesData } from '@/components/schools/shared/use-schools-agencies-data';
import { type School } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useSchoolsCreateFormContext } from '../../shared/SchoolsCreateForm.context';

/* * */

export function SchoolCreateSectionOrganization() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Fetch data

	const { options: agenciesOptions } = useSchoolsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.schools.actions.create],
			scope: PermissionCatalog.all.schools.scope,
		},
	});

	//
	// C. Handle actions

	const handleChangeAgencyId = (value: School['agency_id'], fieldOnChange: (v: School['agency_id']) => void) => {
		fieldOnChange(value);
	};

	//
	// D. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionOrganization.description')}
			title={t('schools:create.SchoolCreateSectionOrganization.title')}
		>
			<Section padding="lg">
				<Grid columns="abc" gap="md">
					{agenciesOptions.length > 1 && (
						<StandardFormController
							control={schoolsCreateForm.control}
							name="agency_id"
							render={({ field, fieldState }) => (
								<Select
									clearable={false}
									data={agenciesOptions}
									error={fieldState.error?.message}
									label={t('schools:create.SchoolCreateSectionGeneral.agency')}
									onBlur={field.onBlur}
									onChange={value => handleChangeAgencyId(value as School['agency_id'], field.onChange)}
									value={field.value}
								/>
							)}
						/>
					)}

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
