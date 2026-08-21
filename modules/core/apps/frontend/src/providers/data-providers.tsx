/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { OrganizationsContextProvider } from '@/contexts/Organizations.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { type PropsWithChildren } from 'react';

/* * */

export function DataProviders({ children }: PropsWithChildren) {
	return (
		<AgenciesContextProvider>
			<RolesContextProvider>
				<OrganizationsContextProvider>
					{children}
				</OrganizationsContextProvider>
			</RolesContextProvider>
		</AgenciesContextProvider>
	);
}
