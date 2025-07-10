/* * */

import { AlertList } from '@/components/list/AlertsList';
import { AlertListContextProvider } from '@/contexts/AlertList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			panes={[
				<AlertListContextProvider>
					<AlertList />
				</AlertListContextProvider>,
				children,
			]}
		/>
	);
}
