/* * */

import { AgenciesList } from '@/components/agencies/list/AgenciesList';
import { AgenciesListContextProvider } from '@/components/agencies/list/AgenciesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="agencies"
			panes={[
				<AgenciesListContextProvider key="agencies-list">
					<AgenciesList />
				</AgenciesListContextProvider>,
				children,
			]}
		/>
	);
}
