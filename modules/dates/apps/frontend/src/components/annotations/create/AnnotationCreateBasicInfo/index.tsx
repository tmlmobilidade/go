'use client';

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { AnnotationSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.annotations.actions.create],
		scope: PermissionCatalog.all.annotations.scope,
	});

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
