/* * */

import { RidesList } from '@/components/rides/list/RidesList';
import { RidesListContextProvider } from '@/components/rides/list/RidesList.context';
import { RideFavoritesContextProvider } from '@/contexts/RideFavorites.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<RideFavoritesContextProvider>
			<PanesManager
				id="rides"
				panes={[
					<RidesListContextProvider key="rides-list">
						<RidesList />
					</RidesListContextProvider>,
					<Fragment key="rides-detail-pane">{children}</Fragment>,
				]}
			/>
		</RideFavoritesContextProvider>
	);
}
