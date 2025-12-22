'use client';

/* * */

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { AnnotationSchema } from '@tmlmobilidade/types';
import { Section, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();

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
		</Section>
	);

	//
}
