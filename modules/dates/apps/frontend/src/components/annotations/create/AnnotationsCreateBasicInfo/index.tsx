'use client';

import { AnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { Grid, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';
import { useAnnotationsCreateFormContext } from '../AnnotationsCreateForm.context';

/* * */

export function AnnotationsCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { capabilities, form } = useAnnotationsCreateFormContext();

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
							placeholder="Ex: Greve de transportes"
							value={field.value ?? ''}
							withAsterisk={!AnnotationSchema.shape.title.isOptional()}
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
							withAsterisk={!AnnotationSchema.shape.description.isOptional()}
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
