'use client';

import { CreateHolidaySchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useHolidaysAgenciesData } from '../../shared/use-holidays-agencies-data';
import { useHolidaysCreateFormContext } from '../HolidaysCreateForm.context';

/* * */

export function HolidayCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useHolidaysCreateFormContext();
	const { error, isLoading, options } = useHolidaysAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.holidays.actions.create],
			scope: PermissionCatalog.all.holidays.scope,
		},
	});

	//
	// B. Render components

	return (
		<Section gap="md">
			{error && <ErrorDisplay message={error} />}
			<StandardFormController
				control={form.control}
				name="title"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:holidays.fields.title.label')}
						onChange={field.onChange}
						placeholder={t('default:holidays.fields.title.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateHolidaySchema.shape.title.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="description"
				render={({ field, fieldState }) => (
					<Textarea
						error={fieldState.error?.message}
						label={t('default:holidays.fields.description.label')}
						minRows={2}
						onChange={field.onChange}
						placeholder={t('default:holidays.fields.description.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateHolidaySchema.shape.description.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options}
						disabled={!capabilities.editEnabled || isLoading || !!error}
						error={fieldState.error?.message}
						label={t('default:holidays.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateHolidaySchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);

	//
}
