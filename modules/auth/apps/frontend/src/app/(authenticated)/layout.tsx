/* * */

import ptTranslation from '@/app/translations/pt.json';
import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { OrganizationsContextProvider } from '@/contexts/Organizations.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { AppProvider, AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppProvider i18n={[{ namespace: 'auth', pt: ptTranslation }]}>
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
