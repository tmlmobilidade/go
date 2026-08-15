/* * */

import { RidesList } from '@/components/rides/list/shared/RidesList';
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
					<RidesList key="rides-list" />,
					<Fragment key="rides-detail-pane">{children}</Fragment>,
				]}
			/>
		</RideFavoritesContextProvider>
	);
}
