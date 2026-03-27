/* eslint-disable react/jsx-key */
/* * */

import { SamsList } from '@/components/sams/list/SamsList';
import { SamsListContextProvider } from '@/contexts/SamsList.context';
import { PanesManager } from '@tmlmobilidade/ui';
import { PropsWithChildren } from 'react';

/* * */

export default function Layout({ children }: PropsWithChildren) {
	return (
		<PanesManager
			id="sams"
			panes={[
				<SamsListContextProvider>
					<SamsList />
				</SamsListContextProvider>,
				children,
			]}
		/>
	);
}
