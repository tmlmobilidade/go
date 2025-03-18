/* * */

import { RidesBoardContextProvider } from '@/contexts/RidesBoard.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<RidesBoardContextProvider>
			{children}
		</RidesBoardContextProvider>
	);
}
