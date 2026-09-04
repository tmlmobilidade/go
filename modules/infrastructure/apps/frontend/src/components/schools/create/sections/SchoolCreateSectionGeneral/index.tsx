'use client';

import { useSchoolsCreateFormContext } from '@/components/schools/create/shared/SchoolsCreateForm.context';
import { Collapsible, CoordinatesInput, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

const periodOrganizationOptions = ['semester', 'trimester'] as const;

/* * */

export function SchoolCreateSectionGeneral() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useSchoolsCreateFormContext();

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
						control={form.control}
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
						control={form.control}
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

					<CoordinatesInput
						label={t('schools:create.SchoolCreateSectionGeneral.coordinates.label')}
						onChange={coordinates => form.setValue('coordinates', coordinates, { shouldDirty: true })}
						value={form.watch('coordinates')}
					/>

					<StandardFormController
						control={form.control}
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
						control={form.control}
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
						control={form.control}
						name="period_organization"
						render={({ field, fieldState }) => (
							<Select
								clearable={false}
								error={fieldState.error?.message}
								label={t('schools:create.SchoolCreateSectionGeneral.period_organization.label')}
								onBlur={field.onBlur}
								onChange={field.onChange}
								placeholder={t('schools:create.SchoolCreateSectionGeneral.period_organization.placeholder')}
								value={field.value}
								w="100%"
								data={periodOrganizationOptions.map(value => ({
									label: t(`schools:create.SchoolCreateSectionGeneral.period_organization.options.${value}`),
									value,
								}))}
							/>
						)}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);
}
