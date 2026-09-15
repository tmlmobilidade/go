'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-annotations-agencies-data';
import { EventSchema } from '@tmlmobilidade/go-types-offer';
import { Grid, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useEventsDetailFormContext } from '../EventsDetailForm.context';

/* * */

export function EventsDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useEventsDetailFormContext();

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
							withAsterisk={!EventSchema.shape.title.isOptional()}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							description={`Deve conter apenas letras maiúsculas, números e underscores. Máximo de ${EventSchema.shape.code.maxLength} caracteres.`}
							error={fieldState.error?.message}
							label="Código"
							maxLength={EventSchema.shape.code.maxLength}
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
							placeholder="Ex: MARAT_LIS"
							readOnly={!capabilities.editEnabled}
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
							error={fieldState.error?.message}
							label="Descrição"
							onBlur={field.onBlur}
							onChange={e => field.onChange(e.currentTarget.value)}
							placeholder="Descrição da ocorrência"
							readOnly={!capabilities.editEnabled}
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
							error={fieldState.error?.message}
							label="Operadores afetados"
							onBlur={field.onBlur}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? []}
							withAsterisk={!EventSchema.shape.agency_ids.isOptional()}
						/>
					)}
				/>
			</Grid>
		</Section>
	);
}
