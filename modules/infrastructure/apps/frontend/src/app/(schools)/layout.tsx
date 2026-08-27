/* * */

import { SchoolsList } from '@/components/list/SchoolsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="schools"
			panes={[
				<SchoolsList key="schools-list" />,
				<Fragment key="schools-detail">{children}</Fragment>,
			]}
		/>
	);
}
