/* * */

import { OrganizationsList } from '@/components/organizations/list/OrganizationsList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="organizations"
			panes={[
				<OrganizationsList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
