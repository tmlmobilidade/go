/* * */

import { RidesListContextProvider } from '@/contexts/RidesList.context';
import { AppWrapper } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<AppWrapper>
			<RidesListContextProvider>
				{children}
			</RidesListContextProvider>
		</AppWrapper>
	);
}
