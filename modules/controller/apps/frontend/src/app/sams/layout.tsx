/* * */

import { SamsList } from '@/components/sams/list/SamsList';
import { SamsListContextProvider } from '@/contexts/SamsList.context';
import { SamsFavoritesContextProvider } from '@/contexts/SamsFavorites.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { Fragment, type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<SamsFavoritesContextProvider>
			<PanesManager
				id="sams"
				panes={[
					<SamsListContextProvider key="sams-list">
						<SamsList />
					</SamsListContextProvider>,
					<Fragment key="sams-detail-pane">{children}</Fragment>,
				]}
			/>
		</SamsFavoritesContextProvider>
	);
}
