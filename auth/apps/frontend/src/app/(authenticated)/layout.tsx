/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { AppWrapper, IsAuthenticated, MeContextProvider } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	//

	//
	// A. Render components

	return (
		<MeContextProvider>
			<AppWrapper>
				<AgenciesContextProvider>
					<RolesContextProvider>
						<IsAuthenticated>
							{children}
						</IsAuthenticated>
					</RolesContextProvider>
				</AgenciesContextProvider>
			</AppWrapper>
		</MeContextProvider>
	);

	//
}
