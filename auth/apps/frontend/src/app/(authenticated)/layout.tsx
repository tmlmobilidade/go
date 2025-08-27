/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
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
						{children}
					</RolesContextProvider>
				</AgenciesContextProvider>
			</AppWrapper>
		</AppProvider>
	);
}
