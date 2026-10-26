'use client';

import { CreateYearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ColorInput, ErrorDisplay, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { usePeriodsAgenciesData } from '../../shared/use-periods-agencies-data';
import { usePeriodsCreateFormContext } from '../PeriodsCreateForm.context';

/* * */

export function PeriodCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = usePeriodsCreateFormContext();
	const { error, isLoading, options } = usePeriodsAgenciesData({ permissions: { actions: [PermissionCatalog.all.year_periods.actions.create], scope: PermissionCatalog.all.year_periods.scope } });

	//
	// B. Render components

	return (
		<Section gap="md" padding="none">
			{error && <ErrorDisplay message={error} />}
			<StandardFormController
				control={form.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:periods.fields.name.label')}
						onChange={field.onChange}
						placeholder={t('default:periods.fields.name.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateYearPeriodSchema.shape.name.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:periods.fields.code.label')}
						onChange={field.onChange}
						placeholder={t('default:periods.fields.code.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateYearPeriodSchema.shape.code.isOptional()}
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
						label={t('default:periods.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateYearPeriodSchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="color"
				render={({ field, fieldState }) => (
					<ColorInput
						error={fieldState.error?.message}
						label={t('default:periods.fields.color.label')}
						onChange={field.onChange}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateYearPeriodSchema.shape.color.isOptional()}
						withEyeDropper={false}
					/>
				)}
			/>
		</Section>
	);
}
