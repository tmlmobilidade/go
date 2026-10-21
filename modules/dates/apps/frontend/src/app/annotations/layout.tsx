/* * */

import { AnnotationsList } from '@/components/annotations/list/AnnotationsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="annotations"
			panes={[
				<AnnotationsList key="list" />,
				children,
			]}
		/>
	);
}
