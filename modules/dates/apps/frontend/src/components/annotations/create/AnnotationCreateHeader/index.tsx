'use client';

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { closeCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function AnnotationCreateHeader() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateAnnotationModal} type="close" />
			<Tag label="Nova Anotação" variant="muted" />
			<Label size="lg" singleLine>{annotationCreateContext.data.form.values.title}</Label>
			<Spacer />
			<Button
				disabled={!annotationCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label="Publicar"
				loading={annotationCreateContext.flags.isSaving}
				onClick={annotationCreateContext.actions.createAnnotation}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
