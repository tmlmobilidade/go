/* * */

import { AnnotationsList } from '@/components/annotations/list/AnnotationsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="annotations"
			panes={[
				<AnnotationsList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
