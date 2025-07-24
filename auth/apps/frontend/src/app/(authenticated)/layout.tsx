/* * */

import { AgenciesContextProvider } from '@/contexts/Agencies.context';
import { RolesContextProvider } from '@/contexts/Roles.context';
import { AppWrapper, MeContextProvider } from '@tmlmobilidade/ui';
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
						{children}
					</RolesContextProvider>
				</AgenciesContextProvider>
			</AppWrapper>
		</MeContextProvider>
	);

	//
}
