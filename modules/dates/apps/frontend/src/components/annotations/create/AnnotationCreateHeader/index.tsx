'use client';

/* * */

import { useAnnotationCreateContext } from '@/components/annotations/create/AnnotationCreate.context';
import { closeCreateAnnotationModal } from '@/components/annotations/create/AnnotationCreate.modal';
import { IconUpload } from '@tabler/icons-react';
import { Button, CloseButton, Label, Spacer, Tag, Toolbar } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AnnotationCreateHeader() {
	//

	//
	// A. Setup variables

	const annotationCreateContext = useAnnotationCreateContext();
	const { t } = useTranslation('dates');

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={closeCreateAnnotationModal} type="close" />
			<Tag label={t('annotations.create.Header.tag')} variant="muted" />
			<Label size="lg" singleLine>{annotationCreateContext.data.form.values.title}</Label>
			<Spacer />
			<Button
				disabled={!annotationCreateContext.data.form.isValid()}
				icon={<IconUpload size={28} />}
				label={t('annotations.create.Header.PublishButton.label')}
				loading={annotationCreateContext.flags.isSaving}
				onClick={annotationCreateContext.actions.createAnnotation}
				variant="primary"
			/>
		</Toolbar>
	);

	//
}
