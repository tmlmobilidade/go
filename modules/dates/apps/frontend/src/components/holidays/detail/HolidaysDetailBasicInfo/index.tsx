'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { HolidaySchema } from '@tmlmobilidade/go-types-offer';
import { Grid, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useHolidaysDetailFormContext } from '../HolidaysDetailForm.context';

/* * */

export function HolidaysDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useHolidaysDetailFormContext();

	const { options: agencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render components

	return (
		<Section gap="lg">
			<Grid columns="a" gap="lg">
				<StandardFormController
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label="Título"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Ex: Greve de transportes"
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							withAsterisk={!HolidaySchema.shape.title.isOptional()}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="description"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label="Descrição"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Descrição da ocorrência"
							readOnly={!capabilities.editEnabled}
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
							error={fieldState.error?.message}
							label="Operadores afetados"
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? []}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
