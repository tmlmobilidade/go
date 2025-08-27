/* * */

import { RealtimeList } from '@/components/realtime/list/RealtimeList';
import { RealtimeListContextProvider } from '@/contexts/RealtimeList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts"
			panes={[
				<RealtimeListContextProvider>
					<RealtimeList />
				</RealtimeListContextProvider>,
				children,
			]}
		/>
	);
}
