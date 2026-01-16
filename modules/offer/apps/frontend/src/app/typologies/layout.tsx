/* * */

import { TypologiesList } from '@/components/typologies/list/TypologiesList';
import { TypologiesListContextProvider } from '@/components/typologies/list/TypologiesList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { type PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="typologies"
			panes={[
				<TypologiesListContextProvider>
					<TypologiesList />
				</TypologiesListContextProvider>,
				children,
			]}
		/>
	);
}
