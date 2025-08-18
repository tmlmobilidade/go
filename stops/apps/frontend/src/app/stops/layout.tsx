/* * */

import { StopsList } from '@/components/stops/list/StopsList';
import { StopsListContextProvider } from '@/contexts/StopsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<StopsListContextProvider>
			<PanesManager
				panes={[
					<StopsList />,
					children,
				]}
			/>
		</StopsListContextProvider>
	);
}
