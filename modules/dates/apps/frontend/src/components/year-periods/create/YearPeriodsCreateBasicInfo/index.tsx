'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { ColorInput, Grid, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { useYearPeriodsCreateFormContext } from '../YearPeriodsCreateForm.context';

/* * */

export function YearPeriodsCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useYearPeriodsCreateFormContext();

	const { options: agencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="md">
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Nome"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Ex: Período Escolar 2024/2025"
							value={field.value ?? ''}
							withAsterisk={!YearPeriodSchema.shape.name.isOptional()}
							data-autofocus
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="agency_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={agencyOptions}
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Operadores"
							onBlur={field.onBlur}
							onChange={field.onChange}
							value={field.value ?? []}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="color"
					render={({ field, fieldState }) => (
						<ColorInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Cor"
							onBlur={field.onBlur}
							onChange={field.onChange}
							value={field.value ?? ''}
							withAsterisk={!YearPeriodSchema.shape.color.isOptional()}
							withEyeDropper={false}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
