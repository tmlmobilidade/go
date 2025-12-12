/* * */

import { AnnotationsList } from '@/components/annotations/list/AnnotationsList';
import { AnnotationsListContextProvider } from '@/contexts/AnnotationsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="annotations"
			panes={[
				<AnnotationsListContextProvider>
					<AnnotationsList />
				</AnnotationsListContextProvider>,
				children,
			]}
		/>
	);
}
