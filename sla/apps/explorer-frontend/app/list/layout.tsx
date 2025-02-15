/* * */

import { RidesListContextProvider } from '@/contexts/RidesList.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<RidesListContextProvider>
			{children}
		</RidesListContextProvider>
	);
}
