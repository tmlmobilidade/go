/* * */

import { RidesList } from '@/components/rides/list/RidesList';
import { RidesListContextProvider } from '@/contexts/RidesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			panes={[
				<RidesListContextProvider>
					<RidesList />
				</RidesListContextProvider>,
				children,
			]}
		/>
	);
}
