'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { EventSchema } from '@tmlmobilidade/go-types-offer';
import { Grid, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useEventsCreateFormContext } from '../EventsCreateForm.context';

/* * */

export function EventsCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useEventsCreateFormContext();

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
							placeholder="Ex: Maratona de Lisboa"
							value={field.value ?? ''}
							withAsterisk={!EventSchema.shape.title.isOptional()}
							data-autofocus
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							description={`Deve conter apenas letras maiúsculas, números e underscores. Máximo de ${EventSchema.shape.code.maxLength} caracteres.`}
							disabled={!capabilities.editEnabled}
							error={fieldState.error?.message}
							label="Código"
							maxLength={EventSchema.shape.code.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
							placeholder="Ex: MARAT_LIS"
							value={field.value ?? ''}
							withAsterisk={!EventSchema.shape.code.isOptional()}
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
							placeholder="Descreva o evento..."
							value={field.value ?? ''}
							withAsterisk={!EventSchema.shape.description.isOptional()}
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
							withAsterisk={!EventSchema.shape.agency_ids.isOptional()}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
