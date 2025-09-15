/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { OrganizationsContextProvider } from '@/contexts/Organizations.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AppWrapper>
				<AgenciesContextProvider>
					<RolesContextProvider>
						<OrganizationsContextProvider>
							{children}
						</OrganizationsContextProvider>
					</RolesContextProvider>
				</AgenciesContextProvider>
			</AppWrapper>
		</AppProvider>
	);
}
