/* * */

import { AgenciesList } from '@/components/agencies/list/AgenciesList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="agencies"
			panes={[
				<AgenciesList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
