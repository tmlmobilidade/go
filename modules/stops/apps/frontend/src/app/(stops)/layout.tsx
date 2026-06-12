/* * */

import { StopsList } from '@/components/stops/list/StopsList';
import { StopsListContextProvider } from '@/components/stops/list/StopsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<StopsListContextProvider>
			<PanesManager
				id="stops-list"
				panes={[
					<StopsList key="stops-list" />,
					children,
				]}
			/>
		</StopsListContextProvider>
	);
}
