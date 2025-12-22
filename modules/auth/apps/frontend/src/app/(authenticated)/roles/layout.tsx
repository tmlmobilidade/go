/* * */

import { RolesList } from '@/components/roles/list/RolesList';
import { RolesListContextProvider } from '@/components/roles/list/RolesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="roles"
			panes={[
				<RolesListContextProvider>
					<RolesList />
				</RolesListContextProvider>,
				children,
			]}
		/>
	);
}
