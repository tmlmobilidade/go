'use client';

/* * */

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { AnnotationSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();
	const { options: allAgencyOptions } = useDataAgencies(PermissionCatalog.all.annotations.scope, PermissionCatalog.all.annotations.actions.create);

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
