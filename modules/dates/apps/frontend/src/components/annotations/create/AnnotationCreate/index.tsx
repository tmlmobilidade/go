'use client';

import { AnnotationCreateBasicInfo } from '@/components/annotations/create/AnnotationCreateBasicInfo';
import { AnnotationCreateHeader } from '@/components/annotations/create/AnnotationCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function AnnotationCreate() {
	return (
		<Pane header={[<AnnotationCreateHeader />]}>
			<AnnotationCreateBasicInfo />
		</Pane>
	);
}
