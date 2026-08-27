'use client';

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { AnnotationSchema } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, Textarea, TextInput } from '@tmlmobilidade/ui';

import { useAnnotationsAgenciesData } from '../../shared/use-users-agencies-data';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();

	const { options: allAgencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Título"
				placeholder="Ex: Greve de transportes"
				required={!AnnotationSchema.shape.title.isOptional()}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('title')}
			/>

			<Textarea
				label="Descrição"
				minRows={2}
				placeholder="Descreva o evento ou observação..."
				required={!AnnotationSchema.shape.description.isOptional()}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('description')}
			/>

			<MultiSelect
				data={allAgencyOptions}
				label="Operadores afetados"
				value={annotationCreateContext.data.form.values.agency_ids || []}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
