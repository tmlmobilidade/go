/* * */

import { RealtimeList } from '@/components/realtime/list/RealtimeList';
import { RealtimeListContextProvider } from '@/components/realtime/list/RealtimeList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="alerts-realtime"
			panes={[
				<RealtimeListContextProvider>
					<RealtimeList />
				</RealtimeListContextProvider>,
				children,
			]}
		/>
	);
}
