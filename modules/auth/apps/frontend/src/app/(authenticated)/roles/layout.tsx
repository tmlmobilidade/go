/* * */

import { RoleCreate } from '@/components/roles/create/RoleCreate';
import { RolesList } from '@/components/roles/list/RolesList';
import { RoleCreateContextProvider } from '@/contexts/RoleCreate.context';
import { RolesListContextProvider } from '@/contexts/RolesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="roles"
			panes={[
				<RoleCreateContextProvider>
					<RolesListContextProvider>
						<RolesList />
					</RolesListContextProvider>
					<RoleCreate />
				</RoleCreateContextProvider>,
				children,
			]}
		/>
	);
}
