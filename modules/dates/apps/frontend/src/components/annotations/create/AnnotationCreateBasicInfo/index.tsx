'use client';

/* * */

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { AnnotationSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();
	const { t } = useTranslation('dates');

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.annotations.actions.create],
		scope: PermissionCatalog.all.annotations.scope,
	});

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label={t('annotations.create.BasicInfo.fields.title.label')}
				placeholder={t('annotations.create.BasicInfo.fields.title.placeholder')}
				required={!AnnotationSchema.shape.title.isOptional()}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('title')}
			/>

			<Textarea
				label={t('annotations.create.BasicInfo.fields.description.label')}
				minRows={2}
				placeholder={t('annotations.create.BasicInfo.fields.description.placeholder')}
				required={!AnnotationSchema.shape.description.isOptional()}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('description')}
			/>

			<MultiSelect
				data={allAgencyOptions}
				label={t('annotations.create.BasicInfo.fields.agency_ids.label')}
				value={annotationCreateContext.data.form.values.agency_ids || []}
				w="100%"
				{...annotationCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
