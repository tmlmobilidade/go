/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { OrganizationsContextProvider } from '@/contexts/Organizations.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { AppProvider, AppWrapper, NotificationsContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider>
			<AppWrapper>
				<NotificationsContextProvider>
					<AgenciesContextProvider>
						<RolesContextProvider>
							<OrganizationsContextProvider>
								{children}
							</OrganizationsContextProvider>
						</RolesContextProvider>
					</AgenciesContextProvider>
				</NotificationsContextProvider>
			</AppWrapper>
		</AppProvider>
	);
}
