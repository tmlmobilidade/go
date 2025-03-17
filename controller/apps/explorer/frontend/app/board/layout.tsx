/* * */

import { FlapsContextProvider } from '@/contexts/Flaps.context';
import { RidesBoardContextProvider } from '@/contexts/RidesBoard.context';
import { type PropsWithChildren } from 'react';

/* * */

export default async function Layout({ children }: PropsWithChildren) {
	return (
		<RidesBoardContextProvider>
			<FlapsContextProvider>
				{children}
			</FlapsContextProvider>
		</RidesBoardContextProvider>
	);
}
