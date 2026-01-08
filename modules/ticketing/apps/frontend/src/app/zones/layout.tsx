/* * */

import { ZonesList } from '@/components/zones/list/ZonesList';
import { ZonesListContextProvider } from '@/components/zones/list/ZonesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="zones"
			panes={[
				<ZonesListContextProvider>
					<ZonesList />
				</ZonesListContextProvider>,
				children,
			]}
		/>
	);
}
