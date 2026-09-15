'use client';

import { AnnotationsCreateBasicInfo } from '@/components/annotations/create/AnnotationsCreateBasicInfo';
import { AnnotationsCreateHeader } from '@/components/annotations/create/AnnotationsCreateHeader';
import { Pane } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsCreate() {
	return (
		<Pane header={[<AnnotationsCreateHeader key="header" />]}>
			<AnnotationsCreateBasicInfo />
		</Pane>
	);
}
