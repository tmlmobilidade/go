/* * */

import { UsersList } from '@/components/users/list/UsersList';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="users"
			panes={[
				<UsersList key="list" />,
				<Fragment key="children">{children}</Fragment>,
			]}
		/>
	);
}
