/* * */

import { OrganizationsList } from '@/components/organizations/list/OrganizationsList';
import { OrganizationsListContextProvider } from '@/components/organizations/list/OrganizationsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="organizations"
			panes={[
				<OrganizationsListContextProvider>
					<OrganizationsList />
				</OrganizationsListContextProvider>,
				children,
			]}
		/>
	);
}
