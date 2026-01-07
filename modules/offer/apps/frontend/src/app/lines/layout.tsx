/* * */

import { LinesList } from '@/components/lines/list/LinesList';
import { LinesListContextProvider } from '@/components/lines/list/LinesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="lines"
			panes={[
				<LinesListContextProvider>
					<LinesList />
				</LinesListContextProvider>,
				children,
			]}
		/>
	);
}
