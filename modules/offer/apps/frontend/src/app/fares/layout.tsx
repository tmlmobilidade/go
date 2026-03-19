/* * */

import { FaresList } from '@/components/fares/list/FaresList';
import { FaresListContextProvider } from '@/components/fares/list/FaresList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="fares"
			panes={[
				<FaresListContextProvider>
					<FaresList />
				</FaresListContextProvider>,
				children,
			]}
		/>
	);
}
