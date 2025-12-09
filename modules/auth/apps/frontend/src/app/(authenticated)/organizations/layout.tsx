/* * */

import { OrganizationCreate } from '@/components/organizations/create/OrganizationCreate';
import { OrganizationsList } from '@/components/organizations/list/OrganizationsList';
import { OrganizationCreateContextProvider } from '@/contexts/OrganizationCreate.context';
import { OrganizationsListContextProvider } from '@/contexts/OrganizationsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="organizations"
			panes={[
				<OrganizationCreateContextProvider>
					<OrganizationsListContextProvider>
						<OrganizationsList />
					</OrganizationsListContextProvider>
					<OrganizationCreate />
				</OrganizationCreateContextProvider>,
				children,
			]}
		/>
	);
}
