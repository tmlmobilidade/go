'use client';

import { Button, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';

/* * */

export function OrganizationsDetailContactFields({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useOrganizationsDetailFormContext();
	const options = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };

	//
	// B. Handle actions

	const handleRemove = () => form.setValue('contacts', (form.getValues('contacts') ?? []).filter((_, contactIndex) => contactIndex !== index), options);

	//
	// C. Render components

	return (
		<Section className={styles.root} gap="sm">
			<Grid columns="ab" gap="md">
				<StandardFormController
					control={form.control}
					name={`contacts.${index}.name`}
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('organizations:detail.OrganizationsDetailContactFields.name')}
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name={`contacts.${index}.job_description`}
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('organizations:detail.OrganizationsDetailContactFields.job_description')}
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
						/>
					)}
				/>
			</Grid>
			<Grid columns="ab" gap="md">
				{(['email', 'phone'] as const).map(name => (
					<StandardFormController
						key={name}
						control={form.control}
						name={`contacts.${index}.${name}`}
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t(`organizations:detail.OrganizationsDetailContactFields.${name}`)}
								onBlur={field.onBlur}
								onChange={event => field.onChange(event.currentTarget.value || undefined)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
							/>
						)}
					/>
				))}
			</Grid>
			<Button
				className={styles.remove}
				disabled={!capabilities.editEnabled}
				label={t('organizations:detail.OrganizationsDetailContactFields.remove')}
				onClick={handleRemove}
				variant="transparent"
			/>
		</Section>
	);
}
