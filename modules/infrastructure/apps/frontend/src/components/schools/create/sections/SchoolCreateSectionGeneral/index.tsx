'use client';

import { useSchoolsCreateFormContext } from '@/components/schools/create/shared/SchoolsCreateForm.context';
import { Collapsible, CoordinatesInput, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function SchoolCreateSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form: schoolsCreateForm } = useSchoolsCreateFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('schools:create.SchoolCreateSectionGeneral.description')}
			title={t('schools:create.SchoolCreateSectionGeneral.title')}
		>
			<Section padding="lg">
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={schoolsCreateForm.control}
						name="code"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.code.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.code.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="name"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.name.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.name.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>

				</Grid>
			</Section>

			<Section padding="lg">
				<Grid columns="ab" gap="md">

					<CoordinatesInput
						label={t('schools:create.SchoolCreateSectionGeneral.coordinates.label')}
						onChange={coordinates => schoolsCreateForm.setValue('coordinates', coordinates, { shouldDirty: true })}
						value={schoolsCreateForm.watch('coordinates')}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="nature"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.nature.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.nature.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="grouping"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.grouping.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.grouping.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={schoolsCreateForm.control}
						name="period_organization"
						render={({ field }) => (
							<TextInput
								label={t('schools:create.SchoolCreateSectionGeneral.period_organization.label')}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.period_organization.placeholder')}
								value={String(field.value)}
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);
}
