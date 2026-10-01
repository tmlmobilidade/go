/* * */

import { RolesList } from '@/components/roles/list/RolesList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="roles"
			panes={[
				<RolesList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
