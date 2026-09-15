'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { HolidaySchema } from '@tmlmobilidade/go-types-offer';
import { Grid, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useHolidaysCreateFormContext } from '../HolidaysCreateForm.context';

/* * */

export function HolidaysCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useHolidaysCreateFormContext();

	const { options: agencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render components

	return (
		<Section gap="md">
			<Grid columns="a" gap="md">
				<StandardFormController
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Título"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Ex: 25 de Abril"
							value={field.value ?? ''}
							withAsterisk={!HolidaySchema.shape.title.isOptional()}
							data-autofocus
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="description"
					render={({ field, fieldState }) => (
						<Textarea
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Descrição"
							minRows={2}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Descreva o evento ou observação..."
							value={field.value ?? ''}
							withAsterisk={!HolidaySchema.shape.description.isOptional()}
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
							label="Operadores afetados"
							onBlur={field.onBlur}
							onChange={field.onChange}
							value={field.value ?? []}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
